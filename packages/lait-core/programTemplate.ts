import * as fs from 'fs';
import * as readline from 'readline';
// IMPORT_STATEMENTS

let FS = ' ';
let TRIM_EMPTY = true;

let INPUT_FILE = 'INPUT_FILEPATH';

// CONSTANT_DEFINITIONS

// for convenience
const print = console.log.bind(console);

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

    await new Promise<void>((resolve) => {
        const rl = readline.createInterface(INPUT_FILE !== '' ? {
            input: fs.createReadStream(INPUT_FILE),
            crlfDelay: Infinity
        } : {
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });

        rl.on('line', (line) => {
            processLine(line);
        });

        rl.once('close', () => {
            resolve();
        });

        rl.on('SIGINT', () => {
            resolve();
        });
    });

    // END_STATEMENTS
}

main();
