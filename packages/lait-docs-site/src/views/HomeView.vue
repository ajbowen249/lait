<!-- WARNING: This file is auto-generated -->
<template>
    <main>
<h1>lait; an AWK-inspired TypeScript Command-Line Utility</h1>
<p><a href="https://github.com/ajbowen249/lait"><em>GitHub</em></a>,
<a href="https://www.npmjs.com/package/@ajbowen249/lait"><em>NPM</em></a></p>
<p><code>lait</code> is a command-line utility designed as an alternative to <code>awk</code>. Like <code>awk</code>, <code>lait</code> matches input line-by-line
against a list of regular expressions and runs the first block of code it matches. Unlike <code>awk</code>, <code>lait</code> uses
<code>TypeScript</code> as its scripting language.</p>
<pre><code class="language-shell">$ cat demo_input
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
$ lait '/#\w{5} (?&lt;name&gt;\w+) (?&lt;quantity&gt;\d+)/; { print(g.name, g.q) }' demo_input
16 Socks
2 Avocado
1 Shampoo
3 Candle
</code></pre>
<p>Here is an interactive version of that example. Both the input &quot;file&quot; and script are editable. Give it a try!</p>

<LaitPlayground
    :default-script-input="scriptInput0"
    :default-file-input="fileInput0"
/><br />
<p>A <code>lait</code> program is just a <code>TypeScript</code> script. However, <code>lait</code> picks it apart and puts it into a wrapper program, where
top-level blocks preceded by a regular expression literal are registered as handlers for matching lines of input. A top-
level block not preceded by a regex will be registered as the default handler if given. Any statements written before
the first handler will be run before scanning input, and all code after the first handler definition will be run after
processing input. Note that this means there is no need for an explicit <code>BEGIN</code> or <code>END</code> block like in <code>awk</code>.</p>
<p>Let's take a look at a more complicated <code>lait</code> script. Like <code>awk</code>, <code>lait</code> can take a file as its script input:</p>
<pre><code class="language-shell">$lait -f demo.lait.ts demo_input
</code></pre>

<LaitPlayground
    :default-script-input="scriptInput1"
    :default-file-input="fileInput1"
/><br />
<p>Note that programs of this size are less common. Like <code>awk</code>, <code>lait</code> programs are meant to be small and integrated into
shell operations.</p>
<p>The first input given to handlers is <code>$</code>, the array of &quot;fields&quot; on the line. Unlike <code>awk</code>, the array is simply a zero-
based array of fields, and there is not a &quot;complete line&quot; entry in <code>$</code>. Like <code>awk</code>, the default field separator is
space, and it can be overridden via the <code>FS</code> global:</p>

<LaitPlayground
    :default-script-input="scriptInput2"
    :default-file-input="fileInput2"
/><br />
<p>The complete list of args given to matchers is:</p>
<ul>
<li><code>$</code>: The set of <code>awk</code>-style fields</li>
<li><code>$_</code>: The complete matched line</li>
<li><code>m</code>: The <code>RegExpMatchArray</code> from matching the line</li>
<li><code>g</code>: <code>m.groups</code> (possibly undefined!)</li>
</ul>

<LaitPlayground
    :default-script-input="scriptInput3"
    :default-file-input="fileInput3"
/><br />
<p><code>lait</code> can also accept input from standard in:</p>
<pre><code class="language-shell">$ ls -al
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
</code></pre>
<h2>Globals</h2>
<p>In addition to <code>FS</code>, there is also <code>TRIM_EMPTY</code>, which is <code>true</code> by default as is usually convenient for processing
space-aligned data like in the <code>ls</code> example. That's less useful when processing CSVs:</p>

<LaitPlayground
    :default-script-input="scriptInput4"
    :default-file-input="fileInput4"
/><br />
<p>Without <code>TRIM_EMPTY=false;</code>, the last line of that would have been:</p>
<pre><code class="language-shell">Bob Nofunpants 4
</code></pre>
<h2>Command-Line Definitions</h2>
<p>Variables can be declared via one or more instances of the <code>-d</code> (<code>--define</code>) command:</p>
<pre><code class="language-shell">$ lait -d x=12 -d y=some_string 'print(x, y)'
12 some_string
</code></pre>
<p>The <code>FS</code> and <code>TRIM_EMPTY</code> variables can also be overridden via this argument. The <code>Globals</code> example could have also been:</p>
<pre><code class="language-shell">$ lait -d FS=, -d TRIM_EMPTY=false '{ print($[0], $[1] || `does not like movies :(`)  }' demo2.csv
Name Favorite Film (Optional)
Cathy Smith A Fistful of Dollars
Paulo Henry MacMasterson III Finding Nemo
Bob Nofunpants does not like movies :(
</code></pre>
<h2>Imports</h2>
<p>You can import from the Node standard library, as well as any node modules you would expect to be accessible either globally or from a module installed in the working directory's <code>node_modules</code>. Note: This doesn't work in the interactive playground since it is run by the browser. Also note that imports from local files are not yet working.</p>
<pre><code class="language-shell">$ lait 'import * as _ from &quot;lodash&quot;; print(_.isNumber(12));'
true
</code></pre>
<h2>Installation</h2>
<p>All you gotta do is</p>
<pre><code class="language-shell">npm i -g @ajbowen249/lait
</code></pre>
<h2>But Why?</h2>
<p>While <code>awk</code> is a very powerful tool, it can have a few rough edges. Those being:</p>
<ol>
<li>Fragmentation - One must always be wary of which implementation they're using, and which builtins are available.</li>
<li>Regex Syntax - <code>awk</code> has yet another regular expression syntax to remember, and it even varies by vendor.</li>
<li>Scripting Syntax - Like the regex point, <code>awk</code> using its own scripting language means one must play the, &quot;is <em>this</em>
how I do x in this language?&quot; game. While <code>TypeScript</code> (and, let's be real, using the type system here will be rare)
is certainly not universal, it's much more likely someone willing to install an <code>NPM</code> package will be familiar with
it. Standard <code>awk</code> is also light on language features and built-ins, and having built-in array sort and higher-order
functions should prove useful in problems typically solved with <code>awk</code>.</li>
</ol>

    </main>
</template>
<script setup lang="ts">

import LaitPlayground from '@/components/LaitPlayground.vue';
import { ref } from 'vue';

const fileInput0 = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);
const fileInput1 = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);
const fileInput2 = ref(`Name,Age,ID
Carol,25,2lf8ah
Bob,21,j8efy3g
Jesse,34,j8fhiuad8`);
const fileInput3 = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);
const fileInput4 = ref(`Name,Favorite Film (Optional),Score
Cathy Smith,A Fistful of Dollars,78
Paulo Henry MacMasterson III,Finding Nemo,4
Bob Nofunpants,,4`);

const scriptInput0 = ref(`/#\\w{5} (?<name>\\w+) (?<q>\\d+)/; { print(g.name, g.q) }`);
const scriptInput1 = ref(`interface Order {
    id: string;
    item: string;
    quantity: number;
}

const letterOrders: Order[] = [];
const digitOrders: Order[] = [];

function parseOrder(g: RegExpMatchArray['groups']) {
    return {
        id: g.id,
        item: g.item,
        quantity: parseInt(g.q),
    };
}

/(?<id>[a-z]\\w{4}) (?<item>\\w+) (?<q>\\d+)/; {
    letterOrders.push(parseOrder(g));
}

/(?<id>\\d\\w{4}) (?<item>\\w+) (?<q>\\d+)/; {
    digitOrders.push(parseOrder(g));
}

function toTable(order: Order) {
    return \`\${order.id}: \${order.quantity} \${order.item}\`;
}

// Note: print is just an alias of console.log
print('Order ID starts with letter:');
print(letterOrders.map(toTable).join('\\n'));

print('Order ID starts with digit:');
print(digitOrders.map(toTable).join('\\n'));`);
const scriptInput2 = ref(`FS=\`,\`; { print(\$[0], \`#\${\$[2]}\`); }`);
const scriptInput3 = ref(`/(?<id>#\\w{5}) (?<name>\\w+) (?<amnt>\\d+)/; { print(\$, \$_, JSON.stringify(m), JSON.stringify(g)) }`);
const scriptInput4 = ref(`FS=\`,\`;TRIM_EMPTY=false; { print(\$[0], \$[1] || \`does not like movies :(\`)  }`);

</script>
