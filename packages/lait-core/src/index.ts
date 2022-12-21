#!/usr/bin/env node
import * as fs from 'fs/promises';
import { exit } from 'process';
import { AppArgs, argsSchema } from './appArgs';
import { getArgs, describe } from './args';
import { run } from './runner';
import { LaitVersion } from './version';

async function main() {
    const args = getArgs(process.argv, argsSchema) as AppArgs;

    if (args.named.help) {
        describe(argsSchema);
        exit(0);
    }

    if (args.named.version) {
        console.log(`${LaitVersion}`);
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

    await run(inputScript, filePath, args.named.define, args.named.transpileOnly);
}

if (require.main === module) {
    main();
}
