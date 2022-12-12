#!/usr/bin/env node
import * as fs from 'fs/promises';
import * as tsNode from 'ts-node';
import { transpile } from './transpiler';
import { exit } from 'process';
import { getArgs, ArgSchema, describe } from './args';

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
    const templateFile = (await fs.readFile([__dirname, '../programTemplate.ts'].join('/'))).toString();

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
        cwd: process.cwd(),
    });

    const transpiledScript = await transpile(inputScript, filePath, templateFile);

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
