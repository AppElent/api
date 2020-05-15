import { Client } from '@microsoft/microsoft-graph-client';
import _ from 'lodash';
import 'isomorphic-fetch';

const getAll = async (client: any, url: string): Promise<Array<any>> => {
    let result: Array<any> = [];
    while (url) {
        const callresult = await client.api(url).get();
        if (callresult?.value?.length > 0) {
            if (result.length === 0) {
                result = callresult.value;
            } else {
                result = result.concat(callresult.value);
            }
        }
        url = callresult['@odata.nextLink'];
    }
    return result;
};

const getFolderStructure = async (client: any): Promise<Array<any>> => {
    const rootfolders = await getAll(client, '/me/mailFolders');
    const getSubFolders = async (client: any, folders: Array<any>): Promise<any> => {
        const results: Array<any> = [];
        for (const folder of folders) {
            const newObject = folder;
            if (folder.childFolderCount > 0) {
                console.log('Folder ' + folder.displayName + ' heeft ' + folder.childFolderCount + ' subfolders');
                const subfolders = await getAll(client, '/me/mailFolders/' + folder.id + '/childFolders');
                newObject.children = await getSubFolders(client, subfolders);
            }
            //console.log(123, newObject, results.length);
            results.push(newObject);
        }
        return results;
    };
    const totalResults: Array<any> = await getSubFolders(client, rootfolders);
    return totalResults;
};

const checkConditions = async (mail: any, rule: any): Promise<boolean> => {
    /**
     * Check conditions
     */
    let proceed = true;
    for (const condition of rule.conditions) {
        let field = _.get(mail, condition.field);
        field = typeof field === 'string' ? field.toLowerCase() : field;
        const value = typeof condition.value === 'string' ? condition.value.toLowerCase() : condition.value;
        if (!field) {
            //throw new Error('Field incorrect: ' + condition.type);
            proceed = false;
            break;
        }
        if (condition.operator === '=') {
            if (field !== value) {
                proceed = false;
                break;
            }
        } else if (condition.operator === 'in') {
            const delimiter = condition.delimiter ?? ',';
            if (!value.split(delimiter).includes(field)) {
                proceed = false;
                break;
            }
        } else if (condition.operator === '<') {
            const parsedDate = Date.parse(field);
            if (parsedDate === NaN) {
                //If no date
            }
            if (typeof value === 'number') {
                if (!(field > value)) {
                    proceed = false;
                    break;
                }
            } else {
                if (!(new Date(field) < value)) {
                    proceed = false;
                    break;
                }
            }
        } else if (condition.operator === 'like') {
            console.log('Like still has to be implemented');
        }
    }
    return proceed;
};

const executeActions = async (client: any, mail: any, rule: any): Promise<boolean> => {
    let moved = false;
    if (!rule.actions) {
        console.log('No actions defined');
        return false;
    }
    for (const action of rule.actions) {
        const type = typeof action.type === 'string' ? action.type.toLowerCase() : action.type;
        console.log('Executing ' + type + ' for mail ' + mail.subject);
        if (type === 'move' && !moved) {
            moved = true;
            const moveresult = await client.api('/me/messages/' + mail.id + '/move').post({
                destinationId: action.value,
            });
        } else if (type === 'tag.add' || type === 'tag.set') {
            //console.log('Tagging mail ' + mail.subject);
        } else if (type === 'forward') {
            //console.log('Tagging mail ' + mail.subject);
        } else if (type === 'delete') {
            const deleteresult = await client.api('/me/messages/' + mail.id).delete();
        }
    }
    return true;
};

export const organizeMail = async (accessToken: string, config: any) => {
    const client = Client.init({
        authProvider: done => {
            done(null, accessToken); //first parameter takes an error if you can't get an access token
        },
    });
    const mails = await getAll(client, '/me/mailFolders/' + config.folder + '/messages');
    for (const mail of mails) {
        console.log(mail);
        const moved = false;
        for (const rule of config.rules) {
            //console.log('Rule ' + rule.name);
            const passedConditions = await checkConditions(mail, rule);

            if (!passedConditions) {
                continue;
            }

            /**
             * Execute actions
             */
            console.log('-------------------------- Executing actions for ' + rule.name);
            await executeActions(client, mail, rule);
        }
    }

    console.log('Einde');
};

const token =
    'EwCIA8l6BAAUO9chh8cJscQLmU+LSWpbnr0vmwwAAUhq0SwkjWymb68XP/vF0Y67mvcFtT5lnwVnWpGoQyTsO0HwD5WAd1obHJGpXfXb7BnHZXjxcB66QpnUNxUmsMlhTV/H5EYjEfXlNl2/iPo1vy0+eASbnTEEBmnf8d6+Nb/e4VI2h3FoFnxk8HszmTOwsqBwpyXHKFp6fBQSaHyJN6DurXv6HzPGnxusAXThI3LnhCuZ9K3Cbr7BbIx1Qiqv0s89tydRh/9QcGdxC3EEiymU26IbHZ/fPUSRqP4N84SOTN4KKKEuzWYRPcEX9IyFfR+NzNlPdDCYFRoRyr1dYBPY9kTps2L5AMc0opbc7QTVz4zahYzPef880XEdRjQDZgAACNpjaZGK6s+WWALkQNQfskyYEUDSygcd8+Q97FHYSzpPW1+zEd5Ep49N31YXgkWObGQRPPpdms4Uft1YnBkwIadzY1TSURA9gY/a68kzFpbdMeLgdFtU9CE/+cywcWk8MkDPpxL6jMZWyjFAGpf5BBhYRYOWuLHlx+sIdZuhU5dFtHKOw+Ks1CimSNw/RhHQW+PRkoIeGG43T8GI9FPLnuKnI3DmoSeMQG9mrPoDbqZ9MVzjEgPKcvpWU5GVSSJU0XgsD7acxeh2T5uyhtyasu6bIQxbMXArHwySSgnyw0/7j9Cpv4IhMCjG/Zx8kSQbxiCuLStlUYU+UIBVHlhxFiH39LMKwFi5l9bluoU79LV64z5whjsZZINRtiduqgUI+GTdlWjNX7Whm+WGFI1qY8yOno+N1CldjDfM1wdqIPlOj0+Iejr9iro+cLl2jsSoRGFwIPfAusJvdqOcnOHii4njFfVoNEFYPYt+YEPrJqZji9fYcv0W37b5B4x3EmNIPJPKxDofkCJFdR2dd5Cy+rKbp85M/EMCQ3FQB8hsPdPc9p2bziuU5iJGDcG2yrncBs2sscD1UF+Iu6oQcLYTjLRESoazZZPjbKbh25rcNvI3LePFleG+Raiw1lAyRIcLvMnMQtoV3oP9hNdMP9Ij/KRFbTpklh++JsJoIneyrV/6/Gnocq0RDtvG2TuGjBgsdE0Wg5DBBX+26sWOlnr/LCJnkbTP9JnHne/6caJLA7fiiwxz0qUIJgt8N0o0oVcReT3YfyYidAOhem7DOiEGeWUD9+2kPHV7i5bua1hVF78a1/KDAg==';

import config from './mailconfig';
organizeMail(token, config).catch(err => console.log(err));
/*
const client = Client.init({
    authProvider: done => {
        done(null, token); //first parameter takes an error if you can't get an access token
    },
});

getAll(client, '/me/outlook/masterCategories')
    .then(result => console.log(result))
    .catch(err => console.log(err));
*/
