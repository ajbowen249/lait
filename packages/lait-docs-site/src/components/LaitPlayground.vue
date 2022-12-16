<template>
    <label for="fileInput">Input</label>
    <button
        v-if="!!defaultFileInput && fileInput !== defaultFileInput"
        @click="() => fileInput = defaultFileInput || ''"
    >
        Reset
    </button>
    <br />
    <textarea v-model="fileInput" id="fileInput" cols="80" rows="7" /><br />

    <label for="scriptInput">Script</label>
    <button
        v-if="!!defaultScriptInput && scriptInput !== defaultScriptInput"
        @click="() => scriptInput = defaultScriptInput || ''"
    >
        Reset
    </button>
    <br />
    <prism-editor
        class="code-editor"
        v-model="scriptInput"
        :highlight="highlighter"
        line-numbers
        rows="1"
    />


    <label for="output">Output</label>
    <button @click="run">Run</button>
    <button @click="() => consoleOutput = ''">Clear</button>
    <br />
    <pre><code class="language-shell">{{ consoleOutput }}</code></pre>
</template>

<script setup lang="ts">
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css';
// @ts-ignore
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';

import { ref, defineProps, onMounted } from 'vue';
import * as t from '../../../lait-core/src/transpiler';
import * as ts from 'typescript';
import { browserTemplate } from '@/browserProgramTemplate';

function highlighter(code: any) {
    return highlight(code, languages.typescript);
}

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

</style>
