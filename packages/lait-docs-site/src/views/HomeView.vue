<template>
    <main>
        <h1>lait; an AWK-inspired TypeScript Command-Line Utility</h1>

        <i><a href="https://github.com/ajbowen249/lait">GitHub</a></i>,
        <i><a href="https://www.npmjs.com/package/@ajbowen249/lait">NPM</a></i>

        <p>
            <span class="code-span">lait</span> is a command-line utility designed as an alternative to <span class="code-span">awk</span>. Like
            <span class="code-span">awk</span>, <span class="code-span">lait</span> matches input line-by-line against a list of regular expressions and runs
            the first block of code it matches. Unlike <span class="code-span">awk</span>, <span class="code-span">lait</span> uses <span class="code-span">
            TypeScript</span> as its scripting language.
        </p><br />
        <textarea cols="80" rows="12" disabled>
$ cat demo_input
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
$ lait '/#\\w{5} \\w+ \\d+/; { print($[2], $[1]) }' demo_input
16 Socks
2 Avocado
1 Shampoo
3 Candle
        </textarea><br /><br />

        <h2>Interactive Example</h2>
        <p>
            Here is an interactive version of that example. Both the input "file" and script are editable. Give it a try!
        </p>

        <LaitPlayground
            :default-script-input="scriptInput1"
            :default-file-input="fileInput1"
        /><br />

        <p>
            A <span class="code-span">lait</span> program is just a <span class="code-span">TypeScript</span> script. However, <span class="code-span">lait
            </span> picks it apart and puts it into a wrapper program, where top-level blocks preceded by a regular expression literal are registered as
            handlers for matching lines of input. A top-level block not preceded by a regex will be registered as the default handler if given. Any statements
            written before the first handler will be run before scanning input, and all code after the first handler definition will be run after processing
            input. Note that this means there is no need for an explicit <span class="code-span">BEGIN</span> or <span class="code-span">END</span> block like
            in <span class="code-span">awk</span>.<br />

            Let's take a look at a more complicated <span class="code-span">lait</span> script. If you want to save your script to a file (helpful for things
            like syntax highlighting!), you can pass the <span class="code-span">-f</span> flag, for example,
        </p><br />

        <textarea cols="60" rows="1" disabled>lait -f demo.lait.ts demo_input</textarea><br />

        <LaitPlayground
            :default-script-input="scriptInput2"
            :default-file-input="fileInput1"
        /><br />

        <p>
            Note that programs of this size are less common. Like <span class="code-span">awk</span>, <span class="code-span">lait</span> programs are meant to
            be small and integrated into shell operations.

            The first input given to handlers is <span class="code-span">$</span>, the array of "fields" on the line. Unlike
            <span class="code-span">awk</span>, the array is simply a zero-based array of fields, and there is not a "complete line" entry in
            <span class="code-span">$</span>. Like <span class="code-span">awk</span>, the default field separator is space, and it can be overridden via the
            <span class="code-span">FS</span> global:
        </p><br />

        <LaitPlayground
            :default-script-input="scriptInput3"
            :default-file-input="fileInput3"
        /><br />

        <p>
            In addition to <span class="code-span">$</span>, the handlers are also given <span class="code-span">m</span>, the <span class="code-span">
            RegExpMatchArray</span> from when it was compared to the regex, as well as <span class="code-span">g</span>, the (possibly undefined) set of
            capture groups, aka <span class="code-span">m.groups</span>:
        </p><br />

        <LaitPlayground
            :default-script-input="scriptInput4"
            :default-file-input="fileInput1"
        /><br />

        <p>
            <span class="code-span">lait</span> can also accept input from standard in:
        </p><br />
        <textarea cols="60" rows="15" disabled>$ ls -al
total 14
drwxr-xr-x 1 user 197609   0 Dec  8 22:01 .
drwxr-xr-x 1 user 197609   0 Dec  8 21:47 ..
-rw-r--r-- 1 user 197609  61 Dec  8 19:19 demo.csv
-rw-r--r-- 1 user 197609 699 Dec  8 22:01 demo.lait.ts
-rw-r--r-- 1 user 197609  87 Dec  8 18:46 demo_input

$ ls -al | lait '/^d|-/;{print($[8], `(${$[4]} bytes)`)}'
. (0 bytes)
.. (0 bytes)
demo.csv (61 bytes)
demo.lait.ts (699 bytes)
demo_input (87 bytes)
        </textarea><br /><br />

        <h2>Globals</h2>

        <p>
            In addition to <span class="code-span">FS</span>, there is also <span class="code-span">TRIM_EMPTY</span>, which is <span class="code-span">true
            </span> by default as is usually convenient for processing space-aligned data like in the <span class="code-span">ls</span> example. That's less
            useful when processing CSVs:
        </p><br />

        <LaitPlayground
            :default-script-input="scriptInput5"
            :default-file-input="fileInput5"
        /><br />

        <p>
            Without <span class="code-span">TRIM_EMPTY=false;</span>, the last line of that would have been:
        </p><br />
        <textarea cols="60" rows="1" disabled>Bob Nofunpants 4</textarea><br /><br />

        <h2>Imports</h2>

        <p>
            You can import from the Node standard library, as well as any node modules you would expect to be accessible either globally or from a module
            installed in the working directory's <span class="code-span">node_modules</span>. Note: This doesn't work in the interactive shell since it is run
            by the browser. Also note that imports from local files are not yet working.
        </p><br />

        <textarea cols="60" rows="3" disabled>$ lait 'import * as _ from "lodash"; print(_.isNumber(12));'
true</textarea>

        <h2>Installation</h2>

        <p>
            All you gotta do is
        </p><br />
        <textarea cols="60" rows="1" disabled>npm i -g @ajbowen249/lait</textarea><br /><br />

        <h2>But Why?</h2>

        <p>
            While <span class="code-span">awk</span> is a very powerful tool, it can have a few rough edges. Those being:
        </p>

        <ol>
            <li>Fragmentation - One must always be wary of which implementation they're using, and which builtins are available.</li>
            <li>Regex Syntax - <span class="code-span">awk</span> has yet another regular expression syntax to remember, and it even varies by vendor.</li>
            <li>Scripting Syntax - Like the regex point, <span class="code-span">awk</span> using its own scripting language means one must play the, "is <i>
            this</i> how I do x in this language?" game. While <span class="code-span">TypeScript</span> (and, let's be real, using the type system here will
            be rare) is certainly not universal, it's much more likely someone willing to install an <span class="code-span">NPM</span> package will be
            familiar with it. Standard <span class="code-span">awk</span> is also light on language features and built-ins, and having built-in array sort and
            higher-order functions should prove useful in problems typically solved with <span class="code-span">awk</span>.</li>
        </ol><br /><br />
    </main>
</template>

<script setup lang="ts">

import LaitPlayground from '@/components/LaitPlayground.vue';
import { ref } from 'vue';
const scriptInput1 = ref('/#\\w{5} \\w+ \\d+/; { print($[2], $[1]) }');
const fileInput1 = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);

const scriptInput2 = ref(`interface Order {
    id: string;
    item: string;
    quantity: number;
}

const letterOrders: Order[] = [];
const digitOrders: Order[] = [];

function parseOrder($: string[]) {
    return {
        id: $[0],
        item: $[1],
        quantity: parseInt($[2]),
    };
}

/[a-z]\\w{4} \\w+ \\d+/; {
    letterOrders.push(parseOrder($));
}

/\\d\\w{4} \\w+ \\d+/; {
    digitOrders.push(parseOrder($));
}

function toTable(order: Order) {
    return \`\${order.id}: \${order.quantity} \${order.item}\`;
}

// Note: print is just an alias of console.log
print('Order ID starts with letter:');
print(letterOrders.map(toTable).join('\\n'));

print('Order ID starts with digit:');
print(digitOrders.map(toTable).join('\\n'));`
);

const scriptInput3 = ref('FS=`,`; { print($[0], `#${$[2]}`); }');
const fileInput3 = ref(`Name,Age,ID
Carol,25,2lf8ah
Bob,21,j8efy3g
Jesse,34,j8fhiuad8`);

const scriptInput4 = ref('/(?<id>#\\w{5}) (?<name>\\w+) (?<a>\\d+)/; { print(g.a, g.name, m[0]) }');

const scriptInput5 = ref('FS=`,`;TRIM_EMPTY=false; {print($[0], $[1] || `hates movies :(`)}');
const fileInput5 = ref(`Name,Favorite Film (Optional),Score
Cathy Smith,A Fistful of Dollars,78
Paulo Henry MacMasterson III,Finding Nemo,4
Bob Nofunpants,,4`);

</script>
