<template>
    <label for="fileInput">Input</label>
    <button
        v-if="!!defaultFileInput && fileInput !== defaultFileInput"
        @click="() => fileInput = defaultFileInput || ''"
    >
        Reset
    </button>
    <br />
    <textarea v-model="fileInput" id="fileInput" cols="80" rows="10" /><br />

    <label for="scriptInput">Script</label>
    <button
        v-if="!!defaultScriptInput && scriptInput !== defaultScriptInput"
        @click="() => scriptInput = defaultScriptInput || ''"
    >
        Reset
    </button>
    <br />
    <textarea v-model="scriptInput" id="scriptInput" cols="80" /><br />


    <label for="output">Output</label>
    <button @click="run">Run</button>
    <button @click="() => consoleOutput = ''">Clear</button>
    <br />
    <textarea v-model="consoleOutput" id="output" cols="80" rows="25" disabled /><br />
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import * as t from '../../../lait-core/src/transpiler';
import * as ts from 'typescript';
import { browserTemplate } from '@/browserProgramTemplate';

const props = defineProps<{
    defaultScriptInput?: string,
    defaultFileInput?: string,
}>();

const scriptInput = ref('');
const fileInput = ref('');
const consoleOutput = ref('');

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

onMounted(() => {
    if (props.defaultFileInput) {
        fileInput.value = props.defaultFileInput;
    }

    if (props.defaultScriptInput) {
        scriptInput.value = props.defaultScriptInput;
        run();
    }
});
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
