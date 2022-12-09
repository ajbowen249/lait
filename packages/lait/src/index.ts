#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as tsNode from 'ts-node';
import { transpile } from 'transpiler/dist';
import { exit } from 'process';

interface ParsedArgs {
    named: { [index: string]: string|number|boolean|undefined };
    positional: string[];
}

interface ArgSchema {
    aliases: { [index: string]: string },
    named: { [index: string]: { isFlag?: boolean, parseAs?: 'number' | 'boolean' } },
}

function getArgs(schema: ArgSchema) {
    const args: ParsedArgs = { named: {}, positional: [] };
    // First pull out non-positional args
    const rawArgs: (string|undefined)[] = process.argv.slice(2);
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
                        console.error(`Missing value for flag ${argName}`);
                        exit(-1);
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

interface Args {
    named: {
        transpileOnly?: boolean;
        file?: string;
    },
    positional: string[],
}

async function main() {
    const args = getArgs({
        aliases: { t: 'transpileOnly', f: 'file' },
        named: {
            transpileOnly: { isFlag: true, parseAs: 'boolean' },
            file: { },
        },
    }) as Args;

    let inputScript: string | undefined;
    let inputFileNameIndex = 1;
    if (args.named.file) {
        inputScript = (await fs.readFile(args.named.file)).toString();
        inputFileNameIndex = 0;
    } else {
        inputScript = args.positional[0];
    }

    if (!inputScript) {
        console.log('Input script required');
        exit(-1);
    }

    const filePath = args.positional[inputFileNameIndex] || '';

    const service = tsNode.create({
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node16',
            esModuleInterop: true,
        },
        transpileOnly: true,
    });

    const transpiledScript = await transpile(inputScript, filePath);

    if (args.named.transpileOnly) {
        console.log(transpiledScript);
        return;
    }

    const compiledScript = service.compile(transpiledScript, 'generated.ts');
    eval(compiledScript);
}

if (require.main === module) {
    main();
}
