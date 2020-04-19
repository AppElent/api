/* eslint-disable @typescript-eslint/no-explicit-any */
import Cache from '../Cache';
import BunqJSClient from '@bunq-community/bunq-js-client';
import Amount from '@bunq-community/bunq-js-client/dist/Types/Amount';

type User = {
    id: number;
};

type Account = {
    type: string;
    value: string;
    id: string;
};

export default class BunqClient {
    public status: string;
    private bunqJSClient: BunqJSClient;
    private user: User;
    private longCache: Cache;
    private shortCache: Cache;
    public environment: string;

    constructor() {
        this.longCache = new Cache();
        this.shortCache = new Cache(300);
    }

    getObject(object: any): string {
        const objectKeys = Object.keys(object);
        const objectKey = objectKeys[0];

        return object[objectKey];
    }

    defaultErrorLogger(error: any): void {
        //console.log('bunq error', error)
        if (error.response) {
            throw error.response.data;
        }
        throw error;
    }

    returnErrorLogger(error: any): {} {
        if (error.response) {
            return { success: false, message: error.response.data };
        }
        return { success: false, message: error };
    }

    async initialize(
        accessToken: string,
        encryptionKey: string,
        environment = 'PRODUCTION',
        store: any,
        options: any = {},
    ): Promise<void> {
        //Status zetten
        this.status = 'STARTING';

        //bunqclient zetten
        this.bunqJSClient = new BunqJSClient(store);

        // load and refresh bunq client
        this.environment = environment;
        console.log('Connecting to environment ' + environment);
        console.log(this.bunqJSClient);
        console.log('key: ' + encryptionKey);
        console.log('accesstoken: ' + accessToken);

        await this.bunqJSClient.run(accessToken, ['*'], environment, encryptionKey).catch(this.defaultErrorLogger);

        // disable keep-alive since the server will stay online without the need for a constant active session
        this.bunqJSClient.setKeepAlive(false);

        console.log('create/re-use a system installation');
        await this.bunqJSClient.install().catch(this.defaultErrorLogger);

        console.log('create/re-use a device installation');
        try {
            await this.bunqJSClient.registerDevice('AdministratieApp');
        } catch (err) {
            console.log('Fout bij laden van BunqClient', err.response.data, err);
            return;
        }

        console.log('create/re-use a bunq session installation');
        await this.bunqJSClient.registerSession().catch(this.defaultErrorLogger);

        //Requestlimiter zetten
        if (options.requestLimiter !== undefined)
            this.bunqJSClient.ApiAdapter.RequestLimitFactory = options.requestLimiter;

        // get user info connected to this account
        const users = await this.bunqJSClient.getUsers(true).catch(this.defaultErrorLogger);
        this.user = users[Object.keys(users)[0]];

        this.status = 'READY';
    }

    getBunqJSClient(): BunqJSClient {
        return this.bunqJSClient;
    }

    getUsers(): User {
        return this.user;
    }

    getUser(): User {
        return this.user;
    }

    async getAccounts(forceUpdate = false): Promise<[]> {
        const cachekey = 'allaccounts';
        if (forceUpdate) this.longCache.del(cachekey);
        const results = this.longCache.get(cachekey, async () => {
            const accounts = await this.bunqJSClient.api.monetaryAccount
                .list(this.user.id)
                .catch(this.defaultErrorLogger);
            const resultList = [];
            for (const account of accounts) {
                const entry: any = this.getObject(account);
                entry['monetary_bank_account_type'] = Object.keys(account)[0];
                resultList.push(entry);
            }
            return resultList;
            //return _.orderBy(resultList, ['description'], ['asc']);
        });

        return results;
    }

    async createRequestInquiry(
        from: Account,
        description: string,
        amount: Amount,
        counterparty: Account,
        options = {},
    ): Promise<any> {
        const accounts = await this.getAccounts();
        const fromAccount: any = accounts.find(account => account[from.type] === from.value);
        if (fromAccount === null) {
            console.log('Van account bestaat niet: ', from);
            return false;
        }
        const inquiry = await this.bunqJSClient.api.requestInquiry
            .post(this.user.id, fromAccount.id, description, amount, counterparty, options)
            .catch(this.defaultErrorLogger);
        return inquiry;
    }

    async createBunqMeTab(from: Account, description: string, amount: Amount, options = {}): Promise<void | boolean> {
        const accounts = await this.getAccounts();
        const fromAccount: any = accounts.find(account => account[from.type] === from.value);
        if (fromAccount === null) {
            console.log('Van account bestaat niet: ', from);
            return false;
        }
        const bunqmetab = await this.bunqJSClient.api.bunqMeTabs
            .post(this.user.id, fromAccount.id, description, amount, options)
            .catch(this.defaultErrorLogger);
        return bunqmetab;
    }

    async createAccount(
        name: string,
        options = { currency: 'EUR', dailyLimit: '1000.00', color: '#ff9500' },
    ): Promise<any> {
        const account = await this.bunqJSClient.api.monetaryAccountBank.post(
            this.user.id,
            options.currency,
            name,
            options.dailyLimit,
            options.color,
        );
        return account;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getEvents(options = {}, forceUpdate = false): Promise<any> {
        const cachekey = 'allevents';
        if (forceUpdate) this.shortCache.del(cachekey);
        const events = this.shortCache.get(cachekey, async () => {
            return await this.bunqJSClient.api.event.list(this.user.id).catch(this.defaultErrorLogger);
        });
        return events;
    }

    async makePaymentInternal(from: Account, to: Account, description: string, amount: string): Promise<any> {
        const accounts = await this.getAccounts();

        const fromAccount: any = accounts.find(account => account[from.type] === from.value);
        const toAccount: any = accounts.find(account => account[from.type] === to.value);
        if (fromAccount == null) {
            console.log('Van account bestaat niet: ', from);
            return { success: false, message: 'Van account bestaat niet (' + from.value + ')' };
        }
        if (toAccount == null) {
            console.log('To account bestaat niet: ', to);
            return { success: false, message: 'Naar account bestaat niet (' + to.value + ')' };
        }

        const counterpartyAlias = toAccount.alias.find((alias: any) => alias.type === 'IBAN'); //this.getAliasByType(to_account, "IBAN");
        const paymentResponse = await this.bunqJSClient.api.payment
            .post(this.user.id, fromAccount.id, description, { value: amount, currency: 'EUR' }, counterpartyAlias)
            .catch(this.returnErrorLogger);

        // iets met paymentResponse doen hier
        return { success: true, paymentResponse };
    }

    async makeDraftPayment(from: Account, to: Account, description: string, amount: string): Promise<any> {
        const accounts = await this.getAccounts();

        const fromAccount: any = accounts.find(account => account[from.type] === from.value);
        if (fromAccount == null) {
            console.log('Van account bestaat niet: ', from);
            return false;
        }
        console.log(from, to, description, amount);
        const paymentResponse = await this.bunqJSClient.api.draftPayment
            .post(this.user.id, fromAccount.id, description, { value: amount, currency: 'EUR' }, to)
            .catch(this.returnErrorLogger);
        return { success: true, paymentResponse };
    }
}
