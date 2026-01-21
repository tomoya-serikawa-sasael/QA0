import { test } from '@playwright/test'

test.describe('05_テスト', () => {
  test.setTimeout(120_000) // タイムアウトを2分に設定

  test('テストケース', async ({ page }) => {
    // ここにテストコードを記述
    console.log('05_テスト')
  })
})
