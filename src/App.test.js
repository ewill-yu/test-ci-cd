import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'

describe('App.vue', () => {
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

  it('increments counter when button clicked', async () => {
    const wrapper = mount(App)
    const button = wrapper.find('button')
    expect(button.text()).toContain('0')
    await button.trigger('click')
    expect(button.text()).toContain('1')
    await button.trigger('click')
    expect(button.text()).toContain('2')
  })
})
