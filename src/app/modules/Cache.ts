import NodeCache from 'node-cache';

export default class Cache {
    private cache: any;
    constructor(private ttlSeconds?: number) {
        if (!ttlSeconds) ttlSeconds = 9999999;
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
    }

    /**
     * Gets value from cache
     * @param key Key used for cache
     * @param storeFunction Optional function parameter which sets the data if the key doesnt exist. If ommitted, undefined is returned
     */
    async get(key: string, storeFunction?: Function): Promise<any> {
        const value = this.cache.get(key);
        if (value) {
            return value;
        }

        if (storeFunction === undefined) {
            return undefined;
        }

        const result = await storeFunction();
        this.cache.set(result);
        return result;
    }

    /**
     * Saves value to cache
     * @param key key to set
     * @param data data to set
     */
    // eslint-disable-next-line
    save(key: string, data: any, ttl?: number): boolean {
        this.cache.set(key, data);
        return true;
    }

    /**
     * Sets value to cache
     * @param key key to set
     * @param data data to set
     */
    // eslint-disable-next-line
    set(key: string, data: any): boolean {
        this.cache.set(key, data);
        return true;
    }

    /**
     * Deleted key from cache
     * @param key Key to delete
     */
    del(key: string): boolean {
        this.cache.del(key);
        return true;
    }

    /**
     * Deletes all keys from cache starting with string
     * @param startStr String to check
     */
    delStartWith(startStr = ''): boolean {
        if (!startStr) {
            return;
        }

        const keys = this.cache.keys();
        for (const key of keys) {
            if (key.indexOf(startStr) === 0) {
                this.del(key);
            }
        }
        return true;
    }

    /**
     * Flushes whole cache
     */
    flush(): boolean {
        this.cache.flushAll();
        return true;
    }

    /**
     * List keys
     */
    list(): Array<string> {
        return this.cache.keys();
    }

    /**
     * Has key
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }
}
