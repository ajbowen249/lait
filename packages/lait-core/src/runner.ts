import * as fs from 'fs/promises';
import * as tsNode from 'ts-node';
import { transpile } from './transpiler';

export async function run(
    inputScript: string,
    filePath: string,
    transpileOnly?: boolean,
) {
    const templateFile = (await fs.readFile([__dirname, '../programTemplate.ts'].join('/'))).toString();

    const service = tsNode.create({
        compilerOptions: {
            module: 'CommonJS',
            moduleResolution: 'node16',
            esModuleInterop: true,
        },
        transpileOnly: true,
        cwd: process.cwd(),
    });

    const transpiledScript = transpile(inputScript, filePath, templateFile);

    if (transpileOnly) {
        console.log(transpiledScript);
        return;
    }

    const compiledScript = service.compile(transpiledScript, 'generated.ts');
    eval(compiledScript);
}
