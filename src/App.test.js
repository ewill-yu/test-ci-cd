import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
  beforeEach(() => {
    window.APP_CONFIG = {
      ENV: 'staging',
      TOKEN: 'test-token-abc',
      API_URL: 'https://api-test.example.com',
    }
  })

  it('renders deploy banner with build time', () => {
    const wrapper = mount(App)
    const banner = wrapper.find('.deploy-banner')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toContain('DEPLOYED')
  })

  it('renders title and intro', () => {
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('test-ci-cd')
    expect(wrapper.text()).toContain('Vue3 + Vite + Docker')
  })

  it('renders env card with values from window.APP_CONFIG', () => {
    const wrapper = mount(App)
    const card = wrapper.find('[data-testid="env-card"]')
    expect(card.exists()).toBe(true)
    expect(card.classes()).toContain('env-staging')
    expect(card.text()).toContain('staging')
    expect(card.text()).toContain('test-token-abc')
    expect(card.text()).toContain('https://api-test.example.com')
  })

  it('falls back to local env when window.APP_CONFIG is missing', () => {
    delete window.APP_CONFIG
    const wrapper = mount(App)
    const card = wrapper.find('[data-testid="env-card"]')
    expect(card.classes()).toContain('env-local')
    expect(card.text()).toContain('local')
  })

  it('increments counter when button clicked', async () => {
    const wrapper = mount(App)
    const button = wrapper.find('button')
    expect(button.text()).toContain('0')
    await button.trigger('click')
    expect(button.text()).toContain('1')
  })
})
