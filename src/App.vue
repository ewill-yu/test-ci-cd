<script setup>
/* global __BUILD_TIME__ */
import { ref, computed } from 'vue'

const count = ref(0)
const buildTime = __BUILD_TIME__

const config = window.APP_CONFIG ?? {
  ENV: 'local',
  TOKEN: '(no token)',
  API_URL: '(no api url)',
}

const envClass = computed(() => `env-${config.ENV}`)
</script>

<template>
  <div class="deploy-banner">🚀 DEPLOYED v2 · build at {{ buildTime }}</div>
  <main class="container">
    <h1>test-ci-cd</h1>
    <p>Vue3 + Vite + Docker + GitHub Actions self-hosted runner</p>

    <section class="env-card" :class="envClass" data-testid="env-card">
      <div class="env-label">ENVIRONMENT</div>
      <div class="env-value">{{ config.ENV }}</div>
      <dl class="env-details">
        <dt>API_URL</dt>
        <dd>{{ config.API_URL }}</dd>
        <dt>TOKEN</dt>
        <dd>{{ config.TOKEN }}</dd>
      </dl>
    </section>

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
.env-card {
  margin: 2rem 0;
  padding: 1.5rem;
  border-radius: 12px;
  border: 3px solid;
  text-align: left;
  font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
}
.env-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  opacity: 0.7;
  margin-bottom: 0.25rem;
}
.env-value {
  font-size: 2rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}
.env-details {
  margin: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.4rem 1rem;
  font-size: 0.9rem;
}
.env-details dt {
  font-weight: 700;
  opacity: 0.7;
}
.env-details dd {
  margin: 0;
  word-break: break-all;
}
.env-staging {
  background: #fff7ed;
  border-color: #f97316;
  color: #7c2d12;
}
.env-production {
  background: #fef2f2;
  border-color: #dc2626;
  color: #7f1d1d;
}
.env-local,
.env-unknown {
  background: #f3f4f6;
  border-color: #6b7280;
  color: #1f2937;
}
button {
  font-size: 1rem;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #888;
  cursor: pointer;
}
</style>
