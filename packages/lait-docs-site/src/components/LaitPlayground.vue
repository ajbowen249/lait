<template>
    <label for="fileInput">Input</label><br />
    <textarea v-model="fileInput" id="fileInput" cols="80" rows="10" /><br />

    <label for="scriptInput">Script</label><br />
    <textarea v-model="scriptInput" id="scriptInput" cols="80" /><br />

    <button @click="run">Run</button><br />

    <label for="output">Output</label><br />
    <textarea v-model="consoleOutput" id="output" cols="80" rows="25" disabled /><br />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as t from '../../../lait-core/src/transpiler';
import * as ts from 'typescript';

const scriptInput = ref('/#\\w{5} \\w+ \\d+/; { print($[2], $[1]) }');
const fileInput = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);
const consoleOutput = ref('');

const browserTemplate = `
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

function getScriptTemplate() {
    return browserTemplate.replace(
        '// BROWSER_INPUT_LINES',
        fileInput.value.split('\n').map(x => `'${x.replace(/\\/, '\\').replace(/'/, '\\\'')}'`).join(',\n'),
    );
}

function run() {
    t.transpile(scriptInput.value, '', getScriptTemplate()).then(x => {
        const js = ts.transpile(x);
        const consoleLog = console.log;
        console.log = (...data: any[]) => {
            consoleLog.bind(console)(...data);
            consoleOutput.value += data.map(x => x.toString()).join(' ');
            consoleOutput.value += '\n';
        };
        eval(js);
        console.log = consoleLog;
    });
}
</script>

<style scoped>
textarea {
    background-color: #808080;
    color: #ffffff;
}

button {
    border: 2px solid #00A000;
    border-radius: 8px;
    background-color: #00A000;
    color: #ffffff;
}
</style>
