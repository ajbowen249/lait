<template>
    <label for="scriptInput">Script</label><br />
    <textarea v-model="scriptInput" id="scriptInput" cols="80" /><br />

    <label for="fileInput">Input</label><br />
    <textarea v-model="fileInput" id="fileInput" cols="80" rows="10" /><br />

    <button @click="run">Run</button><br />

    <label for="output">Output</label><br />
    <textarea v-model="consoleOutput" id="output" cols="80" rows="25" disabled /><br />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import * as t from '../../../lait-core/src/transpiler';
import * as ts from 'typescript';

const scriptInput = ref('');
const fileInput = ref('');
const consoleOutput = ref('');

function print(...args: string[]) {
    (window as any).appendOutputText(args.join(' '));
}

function run() {
    t.transpile(scriptInput.value, '', '// INIT_STATEMENTS').then(x => {
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
