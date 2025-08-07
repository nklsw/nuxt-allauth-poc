import { setup, createPage } from '@nuxt/test-utils/e2e'
import { describe, it, expect } from 'vitest'

describe('signup page', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('displays the signup form', async () => {
    const page = await createPage('/auth/signup')
    expect(await page.getByRole('textbox', { name: 'Email', exact: true }).isVisible()).toBe(true)
    expect(await page.getByRole('textbox', { name: 'Password', exact: true }).isVisible()).toBe(true)
    expect(await page.getByRole('textbox', { name: 'Confirm Password', exact: true }).isVisible()).toBe(true)
    expect(await page.getByRole('button', { name: 'Sign up' }).isVisible()).toBe(true)
  })
})
