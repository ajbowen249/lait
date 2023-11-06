# lait; an AWK-inspired TypeScript Command-Line Utility

[_GitHub_](https://github.com/ajbowen249/lait),
[_NPM_](https://www.npmjs.com/package/@ajbowen249/lait)

![example workflow](https://github.com/ajbowen249/lait/actions/workflows/node.js.yml/badge.svg)

> Check out the interactive version of these docs [here](https://ajbowen249.github.io/lait/)!

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
$ lait '/#\w{5} (?<name>\w+) (?<q>\d+)/; { print(g.name, g.q) }' demo_input
Socks 16
Avocado 2
Shampoo 1
Candle 3
```

A `lait` program is just a `TypeScript` script. However, `lait` picks it apart and puts it into a wrapper program, where
top-level blocks preceded by a regular expression literal are registered as handlers for matching lines of input. A top-
level block not preceded by a regex will be registered as the default handler if given. Any statements written before
the first handler will be run before scanning input, and all code after the first handler definition will be run after
processing input. Note that this means there is no need for an explicit `BEGIN` or `END` block like in `awk`.

Let's take a look at a more complicated `lait` script. Like `awk`, `lait` can take a file as its script input:

```typescript
interface Order {
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

/(?<id>[a-z]\w{4}) (?<item>\w+) (?<q>\d+)/; {
    letterOrders.push(parseOrder(g));
}

/(?<id>\d\w{4}) (?<item>\w+) (?<q>\d+)/; {
    digitOrders.push(parseOrder(g));
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

```shell
$ lait -f demo.lait.ts demo_input
Order ID starts with letter:
#a2fr5: 16 Socks
#d8j38: 2 Avocado
#qb6ag: 3 Candle
Order ID starts with digit:
#8fh39: 1 Shampoo
```

Note that programs of this size are less common. Like `awk`, `lait` programs are meant to be small and integrated into
shell operations.

The first input given to handlers is `$`, the array of "fields" on the line. Unlike `awk`, the array is simply a zero-
based array of fields, and there is not a "complete line" entry in `$`. Like `awk`, the default field separator is
space, and it can be overridden via the `FS` global:

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

The complete list of args given to matchers is:
- `$`: The set of `awk`-style fields
- `$_`: The complete matched line
- `m`: The `RegExpMatchArray` from matching the line
- `g`: `m.groups` (possibly undefined!)

```shell
lait '/(?<id>#\w{5}) (?<name>\w+) (?<amnt>\d+)/; { print($, $_, JSON.stringify(m), JSON.stringify(g)) }' demo_input
#a2fr5,Socks,16 #a2fr5 Socks 16 ["#a2fr5 Socks 16","#a2fr5","Socks","16"] {"id":"#a2fr5","name":"Socks","amnt":"16"}
#d8j38,Avocado,2 #d8j38 Avocado 2 ["#d8j38 Avocado 2","#d8j38","Avocado","2"] {"id":"#d8j38","name":"Avocado","amnt":"2"}
#8fh39,Shampoo,1 #8fh39 Shampoo 1 ["#8fh39 Shampoo 1","#8fh39","Shampoo","1"] {"id":"#8fh39","name":"Shampoo","amnt":"1"}
#qb6ag,Candle,3 #qb6ag Candle 3 ["#qb6ag Candle 3","#qb6ag","Candle","3"] {"id":"#qb6ag","name":"Candle","amnt":"3"}
```

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

Without `TRIM_EMPTY=false;`, the last line of that would have been:
```shell
Bob Nofunpants 4
```

## Command-Line Definitions

Variables can be declared via one or more instances of the `-d` (`--define`) command:

```shell
$ lait -d x=12 -d y=some_string 'print(x, y)'
12 some_string
```

The `FS` and `TRIM_EMPTY` variables can also be overridden via this argument. The `Globals` example could have also been:

```shell
$ lait -d FS=, -d TRIM_EMPTY=false '{ print($[0], $[1] || `does not like movies :(`)  }' demo2.csv
Name Favorite Film (Optional)
Cathy Smith A Fistful of Dollars
Paulo Henry MacMasterson III Finding Nemo
Bob Nofunpants does not like movies :(
```

## Imports

You can import from the Node standard library, as well as any node modules you would expect to be accessible either
globally or from a module installed in the working directory's `node_modules`.

```shell
$ lait 'import * as _ from "lodash"; print(_.isNumber(12));'
true
```

> *Note:* Imports from local files are not yet working

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
