// @ts-ignore
import JSONStore from 'json-store';

const store = (fileLocation: string): any => {
    const store = JSONStore(fileLocation);

    return {
        get: (key: string): any => store.get(key),
        set: (key: string, value: any): void => store.set(key, value),
        remove: (key: string): void => store.set(key, null),
    };
};

export default store;
