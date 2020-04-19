// @ts-ignore

import JSONStore from 'json-store';

type storeType = {
    get: (key: string) => any; //eslint-disable-line
    set: (key: string) => void;
    remove: (key: string) => void;
};

const store = (fileLocation: string): any => {
    const store = JSONStore(fileLocation);

    return {
        get: (key: string): any => store.get(key),
        set: (key: string, value: any): void => store.set(key, value),
        remove: (key: string): void => store.set(key, null),
    };
};

export default store;
