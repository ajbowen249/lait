export const browserTemplate = `
let FS = ' ';
let TRIM_EMPTY = true;

// for convenience
const print = console.log.bind(console);

const LAIT_PROGRAM_INPUT_LINES = [
    // BROWSER_INPUT_LINES
];

type HandlerFunc = (
    // HANDLER_ARGS_LIST
) => Promise<void>;

interface Handler {
    regex: RegExp;
    handler: HandlerFunc,
}

async function main() {
    // INIT_STATEMENTS

    const LAIT_PROGRAM_HANDLERS: Handler[] = [
        // HANDLERS
    ];

    let LAIT_DEFAULT_HANDLER = async (
        // DEFAULT_HANDLER_ARGS_LIST
    ) => {
        // DEFAULT_HANDLER
    };

    // LINE_PROCESS_FUNC

    for (const line of LAIT_PROGRAM_INPUT_LINES) {
        processLine(line);
    }

    // END_STATEMENTS
}

main();
`;
