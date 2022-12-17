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
