import { parse, transpile, ParseResult } from '../src/transpiler';

const basicScript = `let x = 0;
/(?<amount>\d+)/; {
    x += g.amount;
}

{
    print('error: not a number');
}

print('total', x);
`;

const testTemplate = `
// IMPORT_STATEMENTS

// INIT_STATEMENTS

INPUT_FILEPATH

// HANDLERS

// DEFAULT_HANDLER

// END_STATEMENTS
`;

describe('transpiler', () => {
    describe('parse', () => {
        it('can parse a basic script', () => {
            const result = parse(basicScript);

            expect(!!result.defaultBlock).toBeTruthy();
            expect(result.importStatements.length).toBe(0);
            expect(result.initStatements.length).toBe(1);
            expect(result.regexBlockPairs.length).toBe(1);
            expect(result.endStatements.length).toBe(1);
        });
    });

    describe('transpile', () => {
        it('can transpile a basic script', () => {
            const result = transpile(basicScript, 'TEST_FILE', testTemplate);
            const expectedScript = `


let x = 0;

TEST_FILE

{ regex: /(?<amount>d+)/, handler: async ($: string[], m: RegExpMatchArray, g?: RegExpMatchArray['groups']) => {
    x += g.amount;
} }

{
    print('error: not a number');
}

print('total', x);
`;

            expect(result).toBe(expectedScript);
        });
    });
});
