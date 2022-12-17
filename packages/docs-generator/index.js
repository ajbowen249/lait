const fs = require('fs/promises');
const MarkdownIt = require('markdown-it');

const playgroundTagRegex = /<!-- +#playground-(?<type>script|input) +(?<index>\d+) +-->/g;
const htmlCodeSegmentRegex = /<pre>\s*<code class=".*?">\s*(?<content>.*?)\s*<\/code>\s*<\/pre>/gs;

async function main() {
    const file = (await fs.readFile([__dirname, 'docs.md'].join('/'))).toString();
    const lines = file.split('\n');

    const targets = {
        md: [],
        html: [],
    };

    let activeTargets = [];

    for (const line of lines) {
        if (line.startsWith('<!-- #')) {
            const command = line.replace('<!--', '').replace('-->', '').trim();
            const [left, right] = command.split(' ');
            switch (left) {
                case '#targets':
                    activeTargets = right.split(',');
                    continue;
                default:
                    break;
            }
        }

        for (const target of activeTargets) {
            targets[target].push(line);
        }
    }

    const readmeFile = targets.md
        // We don't yank these lines in the initial parse so we can find them later
        .filter(x => !x.match(playgroundTagRegex))
        .join('\n')
    await fs.writeFile([__dirname, '..', '..', 'README.md'].join('/'), readmeFile);

    const inputFiles = [];
    const scripts = [];

    const htmlMD = targets.html.join('\n');
    const md = new MarkdownIt({
        highlight: (str, lang, attrs) => {
            let content = str;
            const maybeMatch = playgroundTagRegex.exec(content);
            if (maybeMatch) {
                content = content
                    .replace(playgroundTagRegex, '')
                    .replace(/\\/g, '\\\\')
                    .replace(/`/g, '\\`')
                    .replace(/\$/g, '\\$')
                    .trim();
                const isScript = maybeMatch.groups.type === 'script';
                const index = maybeMatch.groups.index;
                (isScript ? scripts : inputFiles).push(content);
                return isScript ? `<LaitPlayground
    :default-script-input="scriptInput${index}"
    :default-file-input="fileInput${index}"
/><br />` : '<div />';
            }

            return '';
        },
    });

    let htmlTemplate = md.render(htmlMD);
    // IMPROVE: There's got to be a way to keep md from outputting it this way in the first place...
    htmlTemplate = htmlTemplate.replace(htmlCodeSegmentRegex, (substr, ...args) => {
        if (args.length >= 3) {
            const innerContent = args[3].content;
            if (innerContent === '<div />') {
                return '';
            } else if (innerContent.startsWith('<LaitPlayground')) {
                return innerContent;
            }
        }

        return substr;
    });

    // now put it into Vue
    const vue = `<!-- WARNING: This file is auto-generated -->
<template>
    <main>
${htmlTemplate.split('\n').join('\n')}
    </main>
</template>
<script setup lang="ts">

import LaitPlayground from '@/components/LaitPlayground.vue';
import { ref } from 'vue';

${inputFiles.map((x, i) => `const fileInput${i} = ref(\`${x}\`);`).join('\n')}

${scripts.map((x, i) => `const scriptInput${i} = ref(\`${x}\`);`).join('\n')}

</script>
`;

    await fs.writeFile([__dirname, '..', 'lait-docs-site', 'src', 'views', 'HomeView.vue'].join('/'), vue);
}

main();
