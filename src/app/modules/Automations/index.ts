import _ from 'lodash';

export default class Automation {
    constructor(config: any) {
        //Check all conditions
    }

    private parameters = (...args: any) => {
        return 'parametervalue: ';
    };
    private lookup = (args: any) => 'lookupvalue';

    private allowedFunctions: any = {
        parameters: this.parameters,
        lookup: this.lookup,
    };

    private isFunction = (functionCall: any) =>
        functionCall.hasOwnProperty('function') &&
        functionCall.hasOwnProperty('args') &&
        Array.isArray(functionCall.args);

    private runFunction = (functionCall: any) => {
        const func = this.allowedFunctions[functionCall.function];
        if (!func) {
            throw new Error(`Unknown function: ${functionCall.function}`);
        } else {
            const args = functionCall.args.map((arg: any) => {
                if (this.isFunction(arg)) {
                    return this.runFunction(arg);
                }
                return arg;
            });
            return func(...args);
        }
    };

    public getCalculatedValue = (arg: any) => {
        let newArg = arg;
        if (typeof arg === 'string') {
            try {
                newArg = JSON.parse(arg);
            } catch (err) {
                return arg;
            }
        }
        if (!_.isObject(newArg)) return;
        try {
            const value = newArg;
            if (this.isFunction(value)) {
                return this.runFunction(value);
            } else {
                return arg;
            }
        } catch (ex) {
            return arg;
        }
    };
}

const objecttest = {
    function: 'parameters',
    args: [{ function: 'lookup', args: ['lookupargs'] }],
};
const automation = new Automation(objecttest);
console.log(automation.getCalculatedValue(objecttest));
