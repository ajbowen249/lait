# lait; an AWK-inspired TypeScript Command-Line Utility

`lait` is a command-line utility designed as an alternative to `awk`. Like `awk`, `lait` matches input line-by-line
against a list of regular expressions and runs the first block of code it matches. Unlike `awk`, `lait` uses
`TypeScript` as its scripting language.

```shell
$ cat demo_input
OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avacado 2
#8fh39 Shampoo 1
#qb6ag Candle 3
$ lait '/#\w{5} \w+ \d+/; { print($[2], $[1]) }' demo_input
16 Socks
2 Avacado
1 Shampoo
3 Candle
```

A `lait` program is just a `TypeScript` script. However, `lait` picks it apart and puts it into a wrapper program, where
top-level blocks preceded by a regular expression literal are registered as handlers for matching lines of input. A top-
level block not preceded by a regex will be registered as the default handler if given. Any statements written before
the first handler will be run before scanning input, and all code after the first handler definition will be run after
processing input. Note that this means there is no need for an exlicit `BEGIN` or `END` block like in `awk`.

Let's take a look at a more complicated `lait` script. Like `awk`, `lait` can take a file as its script input:

```typescript
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
print('Order ID starts with letter:\n', letterOrders.map(toTable).join('\n'));
print('Order ID starts with digit:\n', digitOrders.map(toTable).join('\n'));
```

```shell
$ lait -f demo.lait.ts demo_input 
Order ID starts with letter:
#a2fr5: 16 Socks
#d8j38: 2 Avacado
#qb6ag: 3 Candle
Order ID starts with digit:
#8fh39: 1 Shampoo
```

Note that programs of this size are less common. Like `awk`, `lait` programs are meant to be small and integrated into
shell operations.

For now, the only input given to handlers is `$`, the array of "fields" on the line. Unlike `awk`, the array is simply a
zero-based array of fields, and there is not a "complete line" entry (yet). Like `awk`, the default field separator is
space, and it can be overridden via the `FS` global:

```shell
$ cat demo.csv
Name,Age,ID
Carol,25,2lf8ah
Bob,21,j8efy3g
Jesse,34,j8fhiuad8
Hysco@LAPTOP-MKSELCM3 MINGW64 ~/Documents/Code/personal/lait/demo (main)
$ lait 'FS=`,`; { print($[0], `#${$[2]}`); }' demo.csv
Name #ID
Carol #2lf8ah
Bob #j8efy3g
Jesse #j8fhiuad8
```

## But Why?

While `awk` is a very powerful tool, it can have a few rough edges. Those being:

1. Fragmentation - One must always be wary of which implementation they're using, and which builtins are available.
2. Regex Syntax - `awk` has yet another regular expression syntax to remember, and it even varies by vendor.
3. Scripting Syntax - Like the regex point, `awk` using its own scripting language means one must play the, "is _this_
   how I do x in this language?" game. While `TypeScript` (and, let's be real, using the type system here will be rare)
   is certainly not universal, its much more likely someone willing to install an `NPM` package will be familiar with
   it. Standard `awk` is also light on language features and built-ins, and having built-in array sort and higher-order
   functions should prove useful in problems typically solved with `awk`.

## Features ComingSoon™
- Pass regex capture groups to handlers
- Input from standard in
- Register with npm
- imports
