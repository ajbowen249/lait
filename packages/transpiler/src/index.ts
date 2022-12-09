import * as ts from 'typescript';
import * as fs_raw from 'fs';

const fs = fs_raw.promises;

interface RegexStatement extends ts.Statement {
    expression: ts.RegularExpressionLiteral;
}

interface RegexPair {
    regex: RegexStatement;
    block: ts.Statement;
}

export async function transpile(inputScript: string, inputFilePath: string): Promise<string> {
    const templateFile = (await fs.readFile([__dirname, '../programTemplate.ts'].join('/'))).toString();
    const ast = ts.createSourceFile('temp.ts', inputScript, ts.ScriptTarget.ES2022);
    const regexBlockPairs: RegexPair[] = [];
    const importStatements: ts.Statement[] = [];
    const initStatements: ts.Statement[] = [];
    const endStatements: ts.Statement[] = [];
    let defaultBlock: ts.Statement | undefined;

    for (let i = 0; i < ast.statements.length; i++) {
        const current = ast.statements[i];
        if ((current as any).wasParsed) {
            continue;
        }

        const next = i < ast.statements.length - 1 ? ast.statements[i + 1] : undefined;
        if (
            next &&
            current.kind === ts.SyntaxKind.ExpressionStatement &&
            (current as RegexStatement).expression.kind === ts.SyntaxKind.RegularExpressionLiteral &&
            next.kind === ts.SyntaxKind.Block
        ) {
            regexBlockPairs.push({
                regex: current as RegexStatement,
                block: next,
            });

            // eat the next block
            (next as any).wasParsed = true;
        } else if (current.kind === ts.SyntaxKind.ImportClause) {
            importStatements.push(current);
        } else if (current.kind === ts.SyntaxKind.Block) {
            defaultBlock = current;
        } else if (regexBlockPairs.length === 0 && !defaultBlock) {
            initStatements.push(current);
        } else {
            endStatements.push(current);
        }
    }

    let outputString = templateFile;
    outputString = outputString.replace(
        '// IMPORT_STATEMENTS',
        importStatements.map(x => x.getText(ast)).join('\n'),
    );

    outputString = outputString.replace(
        '// INIT_STATEMENTS',
        initStatements.map(x => x.getText(ast)).join('\n'),
    );

    outputString = outputString.replace(
        'INPUT_FILEPATH',
        inputFilePath,
    );

    outputString = outputString.replace(
        '// HANDLERS',
        regexBlockPairs.map(pair => {
            const reText = pair.regex.getText(ast);
            return `            { regex: ${reText.substring(0, reText.length - 1)}, handler: async ($: string[]) => ${pair.block.getText(ast)} }`;
        }).join(',\n'),
    );

    if (defaultBlock) {
        outputString = outputString.replace(
            '// DEFAULT_HANDLER',
            `            ${defaultBlock.getText(ast)}`,
        );
    }

    outputString = outputString.replace(
        '// END_STATEMENTS',
        endStatements.map(x => x.getText(ast)).join('\n'),
    );

    return outputString;
}
