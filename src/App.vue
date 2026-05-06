<script setup>
/* global __BUILD_TIME__ */
import { ref } from 'vue'

const count = ref(0)
const buildTime = __BUILD_TIME__
</script>

<template>
  <div class="deploy-banner">🚀 DEPLOYED v3 · build at {{ buildTime }}</div>
  <main class="container">
    <h1>test-ci-cd</h1>
    <p>Vue3 + Vite + Docker + GitHub Actions self-hosted runner</p>
    <button type="button" @click="count++">點我 +1：{{ count }}</button>
  </main>
</template>

<style scoped>
.deploy-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 0.75rem 1rem;
  text-align: center;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
.container {
  max-width: 640px;
  margin: 6rem auto 4rem;
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
</style>
