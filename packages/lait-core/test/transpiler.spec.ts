import { parse, transpile, MultipleDefaultHandlersError } from '../src/transpiler';

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

// HANDLER_ARGS_LIST

// LINE_PROCESS_FUNC

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

        it('puts all floating statements after the first handler at the end', () => {
            const result = parse(`print(); /a/;{} print(); /b/;{} print();`);

            expect(result.defaultBlock).toBeUndefined();
            expect(result.importStatements.length).toBe(0);
            expect(result.initStatements.length).toBe(1);
            expect(result.regexBlockPairs.length).toBe(2);
            expect(result.endStatements.length).toBe(2);
        });

        it('rejects a program with multiple default handlers', () => {
            expect(() => parse(`{} {}`)).toThrow(new MultipleDefaultHandlersError(0, 2));
        });
    });

    describe('transpile', () => {
        it('can transpile a basic script', () => {
            const result = transpile(basicScript, 'TEST_FILE', testTemplate);
            const expectedScript = `


$: string[], m: RegExpMatchArray, g?: RegExpMatchArray['groups']


const processLine = async (line: string) => {
    let handled = false;
    let fields = line.split(FS);
    if (TRIM_EMPTY) {
        fields = fields.filter(x => x !== '');
    }

    for (const handler of LAIT_PROGRAM_HANDLERS) {
        const match = line.match(handler.regex);
        if (match) {
            await handler.handler(
                fields, match, match.groups
            );
            handled = true;
            break;
        }
    }

    if (!handled) {
        await LAIT_DEFAULT_HANDLER(fields);
    }
};


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
