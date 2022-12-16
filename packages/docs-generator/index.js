const fs = require('fs/promises');

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
                    console.log(activeTargets)
                    continue;
                default:
                    break;
            }
        }

        for (const target of activeTargets) {
            targets[target].push(line);
        }
    }
}

main();
