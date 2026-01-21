import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// 共通の設定とヘルパー関数
const baseUrl = 'https://nanboku.stage.sasael.dev'
const loginId = 'j0001'
const password = 'j0001j0001j0001'
const folderName = '01_'

// 日付フォルダの作成
function getDateFolder() {
  const dateFolder = path.join(process.cwd(), 'test-results', 
    `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`)
  if (!fs.existsSync(dateFolder)) {
    fs.mkdirSync(dateFolder, { recursive: true })
  }
  return dateFolder
}

// ログイン処理
async function login(page: any, loginId: string, password: string) {
  console.log(`ログインページにアクセス中: ${baseUrl}/login`)
  await page.goto(`${baseUrl}/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })

  // ルール: テスト開始画面で1秒のディレイタイムを設定する
  await page.waitForTimeout(1000)

  console.log('ログインIDを入力中...')
  await page.getByRole('textbox', { name: 'ログインID' }).click()
  await page.getByRole('textbox', { name: 'ログインID' }).fill(loginId)

  console.log('パスワードを入力中...')
  await page.getByRole('textbox', { name: 'パスワード' }).click()
  await page.getByRole('textbox', { name: 'パスワード' }).fill(password)

  console.log('ログインボタンをクリック中...')
  
  await Promise.all([
    page.waitForURL(/^(?!.*\/login).*$/, { timeout: 30000 }),
    page.getByRole('button', { name: 'ログイン', exact: true }).first().click()
  ])
  
  await page.waitForTimeout(2000)
  
  console.log(`✓ ログイン成功！現在のURL: ${page.url()}`)
  
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
}

test.describe('自治体ユーザーでのログイン', () => {
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 1-1 学校一覧の確認 =====
  test('1-1 学校一覧の確認', async ({ page }) => {
    const testNumber = '1-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // １　ログインをする
      await login(page, loginId, password)

      // ２　ログイン後1秒ディレイして、キャプチャを取得
      await page.waitForTimeout(1000)
      console.log('キャプチャを取得中...')
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const capturePath = path.join(dateFolder, `${folderName}${testNumber}_${timeStr}.png`)
      await page.screenshot({ path: capturePath, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath}`)
      console.log(`[${testNumber}] テスト結果: OK`)
      console.log(`===== [${testNumber}] テスト終了 =====\n`)
    } catch (error) {
      console.error(`[${testNumber}] テスト結果: NG`)
      console.error(`[${testNumber}] エラー:`, error)
      console.log(`===== [${testNumber}] テスト終了 =====\n`)
      throw error
    }
  })
})
