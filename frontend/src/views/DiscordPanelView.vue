<script setup>
import { useAPIStore } from '@/stores/api';

const api = useAPIStore();

const onClick = () => {
  api.sayHello();
};
</script>

<template>
  <main>
    <button @click="onClick">Click to say that You're a god! 🌌</button>
  </main>
</template>
