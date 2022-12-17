import * as ts from 'typescript';

interface RegexStatement extends ts.Statement {
    expression: ts.RegularExpressionLiteral;
}

interface RegexPair {
    regex: RegexStatement;
    block: ts.Statement;
}

export interface ParseResult {
    sourceFile: ts.SourceFile;
    regexBlockPairs: RegexPair[];
    importStatements: ts.Statement[];
    initStatements: ts.Statement[];
    endStatements: ts.Statement[];
    defaultBlock?: ts.Statement;
}

export class ParseError extends Error {}
export class MultipleDefaultHandlersError extends Error {
    constructor(start1: number, start2: number) {
        super(`Cannot have more than one default handler (first at ${start1}, second at ${start2})`)
    }
}

export function parse(inputScript: string) {
    const sourceFile = ts.createSourceFile('temp.ts', inputScript, ts.ScriptTarget.ES2022);
    const regexBlockPairs: RegexPair[] = [];
    const importStatements: ts.Statement[] = [];
    const initStatements: ts.Statement[] = [];
    const endStatements: ts.Statement[] = [];
    let defaultBlock: ts.Statement | undefined;

    for (let i = 0; i < sourceFile.statements.length; i++) {
        const current = sourceFile.statements[i];
        if ((current as any).wasParsed) {
            continue;
        }

        const next = i < sourceFile.statements.length - 1 ? sourceFile.statements[i + 1] : undefined;
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
        } else if (current.kind === ts.SyntaxKind.ImportDeclaration) {
            importStatements.push(current);
        } else if (current.kind === ts.SyntaxKind.Block) {
            if (!!defaultBlock) {
                throw new MultipleDefaultHandlersError(defaultBlock.pos, current.pos);
            }
            defaultBlock = current;
        } else if (regexBlockPairs.length === 0 && !defaultBlock) {
            initStatements.push(current);
        } else {
            endStatements.push(current);
        }
    }

    return {
        sourceFile,
        regexBlockPairs,
        importStatements,
        initStatements,
        endStatements,
        defaultBlock,
    };
}

export function transpile(inputScript: string, inputFilePath: string, templateFile: string): string {
    const {
        sourceFile,
        regexBlockPairs,
        importStatements,
        initStatements,
        endStatements,
        defaultBlock,
    } = parse(inputScript);

    let outputString = templateFile;
    outputString = outputString.replace(
        '// IMPORT_STATEMENTS',
        importStatements.map(x => x.getText(sourceFile)).join('\n'),
    );

    outputString = outputString.replace(
        '// INIT_STATEMENTS',
        initStatements.map(x => x.getText(sourceFile)).join('\n'),
    );

    outputString = outputString.replace(
        'INPUT_FILEPATH',
        inputFilePath,
    );

    outputString = outputString.replace(
        '// HANDLERS',
        regexBlockPairs.map(pair => {
            const reText = pair.regex.getText(sourceFile);
            return `{ regex: ${reText.substring(0, reText.length - 1)}, handler: async ($: string[], m: RegExpMatchArray, g?: RegExpMatchArray['groups']) => ${ pair.block.getText(sourceFile)} }`;
        }).join(',\n'),
    );

    if (defaultBlock) {
        outputString = outputString.replace(
            '// DEFAULT_HANDLER',
            `${defaultBlock.getText(sourceFile)}`,
        );
    }

    outputString = outputString.replace(
        '// END_STATEMENTS',
        endStatements.map(x => x.getText(sourceFile)).join('\n'),
    );

    return outputString;
}
