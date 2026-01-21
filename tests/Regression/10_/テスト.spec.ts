import { test } from '@playwright/test'

test.describe('10_テスト', () => {
  test.setTimeout(120_000) // タイムアウトを2分に設定

  test('テストケース', async ({ page }) => {
    // ここにテストコードを記述
    console.log('10_テスト')
  })
})
