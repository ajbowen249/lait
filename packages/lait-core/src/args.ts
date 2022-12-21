import * as _ from 'lodash';

export interface ParsedArgs {
    named: { [index: string]: string|number|boolean|undefined|string[]|number[] };
    positional: string[];
}

export interface ArgSchema {
    aliases: { [index: string]: string },
    named: {
        [index: string]: {
            isFlag?: boolean;
            parseAs?: 'number' | 'boolean' | 'string[]' | 'number[]';
            description?: string;
        },
    },
    positional: { name: string; }[],
}

export function describe(schema: ArgSchema) {
    console.log(`usage: lait <options> ${schema.positional.map(x => `[${x.name}]`).join(' ')}`);
    console.log('options:');

    const pairs = Object.keys(schema.named).map(name => {
        const options = schema.named[name];
        const alias = Object.keys(schema.aliases).find(x => schema.aliases[x] === name);
        return {
            left: `--${name}${alias ? ` (-${alias})` : ''}`,
            right: options.description,
        };
    });

    const targetLength = _.max(pairs.map(x => x.left.length))!;

    for (const option of pairs) {
        const filler = new Array(targetLength - option.left.length).fill(' ').join('');
        console.log(`\t${option.left}${filler}\t${option.right}`);
    }
}

export function getArgs(processArgs: string[], schema: ArgSchema) {
    const args: ParsedArgs = { named: {}, positional: [] };
    // First pull out non-positional args
    const rawArgs: (string|undefined)[] = processArgs.slice(2);
    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (!arg) {
            continue;
        }

        if (arg.startsWith('-')) {
            const strippedDash = arg.replace(/^-{1,2}/, '');
            const getFullName = (name: string) => name in schema.aliases ? schema.aliases[name] : name;
            const getValue = (name: string, value: string) => {
                const parseAs = schema.named[name].parseAs;
                if (!parseAs || parseAs === 'string[]') {
                    return value;
                }

                if (parseAs === 'number' || parseAs === 'number[]') {
                    return parseFloat(value);
                } else {
                    return value.toLowerCase() === 'true';
                }
            };

            const applyValue = (argName: string, value: string | number | boolean) => {
                if (!(schema.named[argName].parseAs || '').endsWith('[]')) {
                    args.named[argName] = value;
                } else {
                    if (!args.named[argName]) {
                        args.named[argName] = [];
                    }

                    (args.named[argName] as any[]).push(value);
                }
            };

            if (strippedDash.includes('=')) {
                const parts = strippedDash.split('=');
                const argName = getFullName(parts[0]);
                applyValue(argName, getValue(argName, parts.slice(1).join('=')));
                rawArgs[i] = undefined;
            } else {
                const argName = getFullName(strippedDash);
                if (schema.named[argName]?.isFlag) {
                    args.named[argName] = true;
                    rawArgs[i] = undefined;
                } else {
                    if (i === rawArgs.length - 1 ) {
                        throw new Error(`Missing value for flag ${argName}`);
                    } else {
                        applyValue(argName, getValue(argName, rawArgs[i + 1]!));
                        rawArgs[i] = undefined;
                        rawArgs[i + 1] = undefined;
                    }
                }
            }
        }
    }

    // now do positional
    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg) {
            args.positional.push(arg);
        }
    }

    return args;
}
