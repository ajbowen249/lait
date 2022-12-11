<template>
    <main>
        <LaitPlayground
            :default-script-input="scriptInput"
            :default-file-input="fileInput"
        />
    </main>
</template>

<script setup lang="ts">

import LaitPlayground from '@/components/LaitPlayground.vue';
import { ref } from 'vue';
const scriptInput = ref('/#\\w{5} \\w+ \\d+/; { print($[2], $[1]) }');
const fileInput = ref(`OrderId Item Quantity
#a2fr5 Socks 16
#d8j38 Avocado 2
#8fh39 Shampoo 1
#qb6ag Candle 3`);
</script>
