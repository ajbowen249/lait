import * as args from '../src/args';

const schema: args.ArgSchema = {
    aliases: { f: 'testFlag', n: 'testNum', s: 'testStr' },
    named: {
        testNum: { parseAs: 'number' },
        testFlag: { isFlag: true, parseAs: 'boolean' },
        // not specifying isFlag means it takes the --testBool=true syntax and expect a value
        testBool: { parseAs: 'boolean' },
        testStr: {},
    },
    positional: [
        { name: 'pos0' },
        { name: 'pos1' },
        { name: 'pos2' },
    ],
};

interface TestArgs {
    named: {
        testNum?: number;
        testFlag?: boolean;
        testBool?: boolean;
        testStr?: string;
    },
    positional: string[];
}

describe('args', () => {
    it('can parse args', () => {
        const result = args.getArgs([
            '', '', // First two are skipped
            '--testNum',
            '12',
            '-f',
            'firstPos',
            '--testBool',
            'false',
            'secondPos',
            '--testStr',
            'someString',
            'lastPos'
        ], schema) as TestArgs;

        expect(result.named.testNum).toBe(12);
        expect(result.named.testFlag).toBe(true);
        expect(result.named.testBool).toBe(false);
        expect(result.named.testStr).toBe('someString');
        expect(result.positional[0]).toBe('firstPos');
        expect(result.positional[1]).toBe('secondPos');
        expect(result.positional[2]).toBe('lastPos');
    });

    it('accepts both space and = syntax', () => {
        const result = args.getArgs([
            '', '',
            '--testStr',
            'val',
            '--testNum=15',
        ], schema) as TestArgs;

        expect(result.named.testNum).toBe(15);
        expect(result.named.testStr).toBe('val');
    });

    it('allows for aliases', () => {
        const result = args.getArgs([
            '', '',
            '-n=5',
            '-s=lol',
        ], schema) as TestArgs;

        expect(result.named.testNum).toBe(5);
        expect(result.named.testStr).toBe('lol');
    });

    it('rejects missing values', () => {
        expect(() => args.getArgs([
            '', '',
            '-f',
            '--testBool',
        ], schema)).toThrow();
    });
});
