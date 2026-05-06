<script setup>
import { ref } from 'vue'

const count = ref(0)
const buildTime = new Date().toISOString()
</script>

<template>
  <main class="container">
    <h1>test-ci-cd</h1>
    <p>Vue3 + Vite + Docker + GitHub Actions self-hosted runner</p>
    <button type="button" @click="count++">點我 +1：{{ count }}</button>
    <p class="meta">建置時間（client now）：{{ buildTime }}</p>
  </main>
</template>

<style scoped>
.container {
  max-width: 640px;
  margin: 4rem auto;
  padding: 2rem;
  text-align: center;
}
button {
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #888;
  cursor: pointer;
}
.meta {
  margin-top: 2rem;
  color: #888;
  font-size: 0.85rem;
}
</style>
