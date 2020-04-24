import SimpleOauth2, {
    ModuleOptions,
    OAuthClient,
    AccessToken,
    AuthorizationTokenConfig,
    Token,
    PasswordTokenConfig,
} from 'simple-oauth2';

export interface CustomOptions {
    flow: 'authorization' | 'password' | 'client_credentials';
    redirectUrl: string;
    defaultScope: string;
}

type FormatUrlOptions = {
    /** A string that represents the registered application URI where the user is redirected after authentication */
    redirect_uri?: string;
    /** A string or array of strings that represents the application privileges */
    scope?: string | string[];
    /** A string that represents an option opaque value used by the client to main the state between the request and the callback */
    state?: string;
};

export default class Oauth {
    public credentials: ModuleOptions;
    public oauth: OAuthClient;
    public flow: string;
    public defaultScope: string;
    public redirectUrl: string;

    constructor(credentials: ModuleOptions, options: CustomOptions) {
        const { flow, redirectUrl, defaultScope } = options; //eslint-disable-line
        this.flow = flow;
        this.redirectUrl = redirectUrl; //eslint-disable-line
        this.defaultScope = defaultScope;
        this.credentials = credentials;
        this.oauth = SimpleOauth2.create(this.credentials);
    }

    formatUrl(state: string = null): string {
        const url = this.redirectUrl;
        const formatUrlOptions: FormatUrlOptions = {
            redirect_uri: url, // eslint-disable-line
        };
        if (this.defaultScope) {
            formatUrlOptions['scope'] = this.defaultScope;
        }
        if (state) {
            formatUrlOptions['state'] = state;
        }
        const authorizationUri = this.oauth.authorizationCode.authorizeURL(formatUrlOptions);
        return authorizationUri;
    }

    async getToken(options: AuthorizationTokenConfig | PasswordTokenConfig): Promise<AccessToken> { // eslint-disable-line
        // Get the access token object (the authorization code is given from the previous step).
        const url = this.redirectUrl;
        // Save the access token
        let result;
        if (this.flow === 'authorization') {
            const authorizationTokenConfig: AuthorizationTokenConfig = {
                code: options.code,
                redirect_uri: url, // eslint-disable-line
                //scope: options.scope ?? this.defaultScope ?? '',
            };
            const scope = options.scope ?? this.defaultScope;
            if (scope) {
                authorizationTokenConfig.scope = scope;
            }
            result = await this.oauth.authorizationCode.getToken(authorizationTokenConfig);
        } else if (this.flow === 'password') {
            const passwordTokenConfig: PasswordTokenConfig = {
                username: options.username,
                password: options.password,
                scope: options.scope ?? this.defaultScope ?? '',
            };
            result = await this.oauth.ownerPassword.getToken(passwordTokenConfig);
        }
        const accessToken = this.oauth.accessToken.create(result);
        return accessToken;
    }

    async refresh(accessToken: AccessToken, options?: { force: boolean }): Promise<AccessToken | undefined> {
        const tokenObject: Token = {
            access_token: accessToken.token.access_token, // eslint-disable-line
            refresh_token: accessToken.token.refresh_token, // eslint-disable-line
            expires_at: accessToken.token.expires_at, // eslint-disable-line
        };
        let accessTokenObject: AccessToken = this.oauth.accessToken.create(tokenObject);

        // Check if the token is expired. If expired it is refreshed.
        if (accessTokenObject.expired() || options?.force) {
            accessTokenObject = await accessTokenObject.refresh();
        } else {
            return;
        }
        return accessTokenObject;
    }
}
