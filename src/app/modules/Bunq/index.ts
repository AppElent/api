import BunqClient from './BunqClient';
import BunqJSClient from '@bunq-community/bunq-js-client';
import RequestLimitFactory from '@bunq-community/bunq-js-client/dist/RequestLimitFactory';
import store from './Store';

interface BunqClients {
    [key: string]: BunqClient;
}

export default class Bunq {
    public status: string;
    private genericBunqClient: BunqJSClient;
    private requestLimiter: RequestLimitFactory;
    private bunqClients: BunqClients;
    private folder: string;

    constructor(folder: string) {
        this.bunqClients = {};
        this.folder = folder;
    }

    loadGenericClient(): void {
        this.genericBunqClient = new BunqJSClient(store(this.folder + '/genericClient.json'));
    }

    async load(
        key: string,
        accessToken: string,
        encryptionKey: string,
        environment: string,
        options: {},
    ): Promise<void> {
        this.bunqClients[key] = new BunqClient();
        console.log('key: ' + key);
        console.log('accesstoken: ' + accessToken);
        console.log('encryptionkey: ' + encryptionKey);
        console.log('options: ' + options);
        console.log('environment: ' + environment);
        await this.bunqClients[key].initialize(
            accessToken,
            encryptionKey,
            environment,
            store(this.folder + '/' + key + '.json'),
            options,
        );
    }

    getGenericClient(): BunqJSClient {
        //get generic client (to generate keys etc)
        return this.genericBunqClient;
    }

    getClient(identifier: string): BunqClient {
        if (!this.bunqClients[identifier]) throw 'Cannot find bunq connection';
        //get client by identifier
        return this.bunqClients[identifier];
    }
}
