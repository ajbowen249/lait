<!-- This file specifies the docs for both the main README.md and the HTML docs site. -->
<!-- #targets md,html -->
# lait; an AWK-inspired TypeScript Command-Line Utility

[_GitHub_](https://github.com/ajbowen249/lait),
[_NPM_](https://www.npmjs.com/package/@ajbowen249/lait)

<!-- #targets md -->
> Check out the interactive version of these docs [here](https://ajbowen249.github.io/lait/)!
<!-- #targets md,html -->

`lait` is a command-line utility designed as an alternative to `awk`. Like `awk`, `lait` matches input line-by-line
against a list of regular expressions and runs the first block of code it matches. Unlike `awk`, `lait` uses
`TypeScript` as its scripting language.

```shell
$ cat demo_input
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
$ lait '/#\w{5} \w+ \d+/; { print($[2], $[1]) }' demo_input
16 Socks
2 Avocado
1 Shampoo
3 Candle
```
<!-- #targets html -->
Here is an interactive version of that example. Both the input "file" and script are editable. Give it a try!

```none
<!-- #playground-input 0 -->
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
```

```typescript
<!-- #playground-script 0 -->
/#\w{5} \w+ \d+/; { print($[2], $[1]) }
```

<!-- #targets md,html -->

A `lait` program is just a `TypeScript` script. However, `lait` picks it apart and puts it into a wrapper program, where
top-level blocks preceded by a regular expression literal are registered as handlers for matching lines of input. A top-
level block not preceded by a regex will be registered as the default handler if given. Any statements written before
the first handler will be run before scanning input, and all code after the first handler definition will be run after
processing input. Note that this means there is no need for an explicit `BEGIN` or `END` block like in `awk`.

Let's take a look at a more complicated `lait` script. Like `awk`, `lait` can take a file as its script input:
<!-- #targets html -->
```shell
$lait -f demo.lait.ts demo_input
```

```none
<!-- #playground-input 1 -->
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
```
<!-- #targets md,html -->

```typescript
<!-- #playground-script 1 -->
interface Order {
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

/[a-z]\w{4} \w+ \d+/; {
    letterOrders.push(parseOrder($));
}

/\d\w{4} \w+ \d+/; {
    digitOrders.push(parseOrder($));
}

function toTable(order: Order) {
    return `${order.id}: ${order.quantity} ${order.item}`;
}

// Note: print is just an alias of console.log
print('Order ID starts with letter:');
print(letterOrders.map(toTable).join('\n'));

print('Order ID starts with digit:');
print(digitOrders.map(toTable).join('\n'));
```

<!-- #targets md -->
```shell
$ lait -f demo.lait.ts demo_input
Order ID starts with letter:
#a2fr5: 16 Socks
#d8j38: 2 Avocado
#qb6ag: 3 Candle
Order ID starts with digit:
#8fh39: 1 Shampoo
```
<!-- #targets md,html -->

Note that programs of this size are less common. Like `awk`, `lait` programs are meant to be small and integrated into
shell operations.

The first input given to handlers is `$`, the array of "fields" on the line. Unlike `awk`, the array is simply a zero-
based array of fields, and there is not a "complete line" entry in `$`. Like `awk`, the default field separator is
space, and it can be overridden via the `FS` global:

<!-- #targets html-->
```shell
<!-- #playground-input 2 -->
Name,Age,ID
Carol,25,2lf8ah
Bob,21,j8efy3g
Jesse,34,j8fhiuad8
```

```typescript
<!-- #playground-script 2 -->
FS=`,`; { print($[0], `#${$[2]}`); }
```
<!-- #targets md-->
```shell
$ cat demo.csv
Name,Age,ID
Carol,25,2lf8ah
Bob,21,j8efy3g
Jesse,34,j8fhiuad8

$ lait 'FS=`,`; { print($[0], `#${$[2]}`); }' demo.csv
Name #ID
Carol #2lf8ah
Bob #j8efy3g
Jesse #j8fhiuad8
```
<!-- #targets md,html-->

In addition to `$`, the handlers are also given `m`, the `RegExpMatchArray` from when it was compared to the regex, as
well as `g`, the (possibly undefined) set of capture groups, aka `m.groups`:

<!-- #targets html-->
```shell
<!-- #playground-input 3 -->
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
```

```typescript
<!-- #playground-script 3 -->
/(?<id>#\w{5}) (?<name>\w+) (?<amnt>\d+)/; { print(g.amnt, g.name, m[0]) }
```
<!-- #targets md-->
```shell
lait '/(?<id>#\w{5}) (?<name>\w+) (?<amnt>\d+)/; { print(g.amnt, g.name, m[0]) }' demo_input
16 Socks #a2fr5 Socks 16
2 Avocado #d8j38 Avocado 2
1 Shampoo #8fh39 Shampoo 1
3 Candle #qb6ag Candle 3
```
<!-- #targets md,html-->

`lait` can also accept input from standard in:

```shell
$ ls -al
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
```

## Globals

In addition to `FS`, there is also `TRIM_EMPTY`, which is `true` by default as is usually convenient for processing
space-aligned data like in the `ls` example. That's less useful when processing CSVs:

<!-- #targets html-->
```shell
<!-- #playground-input 4 -->
Name,Favorite Film (Optional),Score
Cathy Smith,A Fistful of Dollars,78
Paulo Henry MacMasterson III,Finding Nemo,4
Bob Nofunpants,,4
```

```typescript
<!-- #playground-script 4 -->
FS=`,`;TRIM_EMPTY=false; { print($[0], $[1] || `does not like movies :(`)  }
```
<!-- #targets md-->
```shell
$ cat demo2.csv
Name,Favorite Film (Optional),Score
Cathy Smith,A Fistful of Dollars,78
Paulo Henry MacMasterson III,Finding Nemo,4
Bob Nofunpants,,4

$ lait 'FS=`,`;TRIM_EMPTY=false; { print($[0], $[1] || `does not like movies :(`)  }' demo2.csv
Name Favorite Film (Optional)
Cathy Smith A Fistful of Dollars
Paulo Henry MacMasterson III Finding Nemo
Bob Nofunpants does not like movies :(
```
<!-- #targets md,html-->

Without `TRIM_EMPTY=false;`, the last line of that would have been:
```shell
Bob Nofunpants 4
```

## Imports

<!-- #targets md -->
You can import from the Node standard library, as well as any node modules you would expect to be accessible either
globally or from a module installed in the working directory's `node_modules`.

```shell
$ lait 'import * as _ from "lodash"; print(_.isNumber(12));'
true
```

> *Note:* Imports from local files are not yet working

<!-- #targets html -->
 You can import from the Node standard library, as well as any node modules you would expect to be accessible either globally or from a module installed in the working directory's `node_modules`. Note: This doesn't work in the interactive playground since it is run by the browser. Also note that imports from local files are not yet working.

```shell
$ lait 'import * as _ from "lodash"; print(_.isNumber(12));'
true
```
<!-- #targets md,html -->
## Installation

All you gotta do is

```shell
npm i -g @ajbowen249/lait
```

## But Why?

While `awk` is a very powerful tool, it can have a few rough edges. Those being:

1. Fragmentation - One must always be wary of which implementation they're using, and which builtins are available.
2. Regex Syntax - `awk` has yet another regular expression syntax to remember, and it even varies by vendor.
3. Scripting Syntax - Like the regex point, `awk` using its own scripting language means one must play the, "is _this_
   how I do x in this language?" game. While `TypeScript` (and, let's be real, using the type system here will be rare)
   is certainly not universal, it's much more likely someone willing to install an `NPM` package will be familiar with
   it. Standard `awk` is also light on language features and built-ins, and having built-in array sort and higher-order
   functions should prove useful in problems typically solved with `awk`.