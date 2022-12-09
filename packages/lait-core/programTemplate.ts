import * as fs from 'fs';
// IMPORT_STATEMENTS

let FS = ' ';

let INPUT_FILE = 'INPUT_FILEPATH';

// for convenience
const print = console.log.bind(console);

async function getInputFileLines() {
    return (await fs.promises.readFile(INPUT_FILE)).toString().split('\n');
}

interface Handler {
    regex: RegExp;
    handler: ($: string[]) => Promise<void>,
}

async function main() {
// INIT_STATEMENTS

    const LAIT_PROGRAM_INPUT_LINES = INPUT_FILE !== '' ?
        await getInputFileLines() :
        [];

    const LAIT_PROGRAM_HANDLERS: Handler[] = [
// HANDLERS
    ];

    let LAIT_DEFAULT_HANDLER = async ($: string[]) => {
// DEFAULT_HANDLER
    };

    for (const line of LAIT_PROGRAM_INPUT_LINES) {
        let handled = false;
        const fields = line.split(FS);
        for (const handler of LAIT_PROGRAM_HANDLERS) {
            const match = line.match(handler.regex);
            if (match) {
                await handler.handler(fields);
                handled = true;
                break;
            }
        }

        if (!handled) {
            await LAIT_DEFAULT_HANDLER(fields);
        }
    }

// END_STATEMENTS
}

main();
