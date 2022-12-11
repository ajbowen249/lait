export const browserTemplate = `
let FS = ' ';
let TRIM_EMPTY = true;

// for convenience
const print = console.log.bind(console);

const LAIT_PROGRAM_INPUT_LINES = [
    // BROWSER_INPUT_LINES
];

type HandlerFunc = ($: string[], m: RegExpMatchArray, g?: RegExpMatchArray['groups']) => Promise<void>;

interface Handler {
    regex: RegExp;
    handler: HandlerFunc,
}

async function main() {
    // INIT_STATEMENTS

    const LAIT_PROGRAM_HANDLERS: Handler[] = [
        // HANDLERS
    ];

    let LAIT_DEFAULT_HANDLER = async ($: string[]) => {
        // DEFAULT_HANDLER
    };

    const processLine = async (line: string) => {
        let handled = false;
        let fields = line.split(FS);
        if (TRIM_EMPTY) {
            fields = fields.filter(x => x !== '');
        }

        for (const handler of LAIT_PROGRAM_HANDLERS) {
            const match = line.match(handler.regex);
            if (match) {
                await handler.handler(fields, match, match.groups);
                handled = true;
                break;
            }
        }

        if (!handled) {
            await LAIT_DEFAULT_HANDLER(fields);
        }
    };

    for (const line of LAIT_PROGRAM_INPUT_LINES) {
        processLine(line);
    }

    // END_STATEMENTS
}

main();
`;
