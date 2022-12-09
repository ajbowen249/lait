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
