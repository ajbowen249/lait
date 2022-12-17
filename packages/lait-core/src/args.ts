export interface ParsedArgs {
    named: { [index: string]: string|number|boolean|undefined };
    positional: string[];
}

export interface ArgSchema {
    aliases: { [index: string]: string },
    named: {
        [index: string]: {
            isFlag?: boolean;
            parseAs?: 'number' | 'boolean';
            description?: string;
        },
    },
    positional: { name: string; }[],
}

export function describe(schema: ArgSchema) {
    console.log(`usage: lait <flags> ${schema.positional.map(x => `[${x.name}]`).join(' ')}`);
    console.log('flags:');
    for (const name of Object.keys(schema.named)) {
        const options = schema.named[name];
        const alias = Object.keys(schema.aliases).find(x => schema.aliases[x] === name);
        console.log(`\t--${name}${alias ? ` (-${alias})` : ''}\t${options.description}`);
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
                if (!parseAs) {
                    return value;
                }

                if (parseAs === 'number') {
                    return parseFloat(value);
                } else {
                    return value.toLowerCase() === 'true';
                }
            };

            if (strippedDash.includes('=')) {
                const parts = strippedDash.split('=');
                const argName = getFullName(parts[0]);
                args.named[argName] = getValue(argName, parts[1]);
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
                        const value = rawArgs[i + 1]!;
                        args.named[argName] = getValue(argName, value);
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
