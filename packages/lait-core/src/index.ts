#!/usr/bin/env node
import * as fs from 'fs/promises';
import { exit } from 'process';
import { getArgs, ArgSchema, describe } from './args';
import { run } from './runner';

const argsSchema: ArgSchema = {
    aliases: { t: 'transpileOnly', f: 'file', h: 'help' },
    named: {
        transpileOnly: {
            description: 'Only print transpiled file and exit. Do not execute.',
            isFlag: true,
            parseAs: 'boolean',
        },
        file: {
            description: 'Open script file in lieu of passing a positional arg',
        },
        help: {
            description: 'Print help text and exit.',
            isFlag: true,
            parseAs: 'boolean',
        },
    },
    positional: [
        { name: 'script' },
        { name: 'input' },
    ],
};

interface AppArgs {
    named: {
        transpileOnly?: boolean;
        file?: string;
        help?: boolean;
    },
    positional: string[],
}

async function main() {
    const args = getArgs(argsSchema) as AppArgs;

    if (args.named.help) {
        describe(argsSchema);
        exit(0);
    }

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
        describe(argsSchema);
        exit(-1);
    }

    const filePath = args.positional[inputFileNameIndex] || '';

    await run(inputScript, filePath, args.named.transpileOnly);
}

if (require.main === module) {
    main();
}
