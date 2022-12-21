import { ArgSchema } from "./args";
import { LaitVersion } from "./version";

export const argsSchema: ArgSchema = {
    aliases: { t: 'transpileOnly', f: 'file', h: 'help', v: 'version', d: 'define' },
    named: {
        transpileOnly: {
            description: 'Only print transpiled file and exit. Do not execute.',
            isFlag: true,
            parseAs: 'boolean',
        },
        file: {
            description: 'Open script file in lieu of passing a positional arg',
        },
        define: {
            description: 'Define variables to be used in the script. Pass multiple times for multiple variables (lait -d x=12 -d name=bob)',
            parseAs: 'string[]',
        },
        help: {
            description: 'Print help text and exit.',
            isFlag: true,
            parseAs: 'boolean',
        },
        version: {
            description: `Prints the current version of lait (${LaitVersion}) and exits`,
            isFlag: true,
            parseAs: 'boolean',
        },
    },
    positional: [
        { name: 'script' },
        { name: 'input' },
    ],
};

export interface AppArgs {
    named: {
        transpileOnly?: boolean;
        file?: string;
        help?: boolean;
        version?: boolean;
        define?: string[];
    },
    positional: string[],
}
