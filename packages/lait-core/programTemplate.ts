import * as fs from 'fs/promises';
import * as readline from 'readline';
// IMPORT_STATEMENTS

let FS = ' ';
let TRIM_EMPTY = true;

let INPUT_FILE = 'INPUT_FILEPATH';

// for convenience
const print = console.log.bind(console);

async function getInputFileLines() {
    return (await fs.readFile(INPUT_FILE)).toString().split('\n');
}

type HandlerFunc = ($: string[], m: RegExpMatchArray) => Promise<void>;

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
                await handler.handler(fields, match);
                handled = true;
                break;
            }
        }

        if (!handled) {
            await LAIT_DEFAULT_HANDLER(fields);
        }
    };

    if (INPUT_FILE !== '') {
        const LAIT_PROGRAM_INPUT_LINES = await getInputFileLines();
        for (const line of LAIT_PROGRAM_INPUT_LINES) {
            processLine(line);
        }
    } else {
        await new Promise<void>((resolve, reject) => {
            const rl = readline.createInterface({
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
    }

    // END_STATEMENTS
}

main();
