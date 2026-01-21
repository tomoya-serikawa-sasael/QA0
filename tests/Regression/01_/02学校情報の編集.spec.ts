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

// 実施日の年月日を取得
function getDateStr() {
  const today = new Date()
  return `${today.getFullYear()}年${String(today.getMonth() + 1).padStart(2, '0')}月${String(today.getDate()).padStart(2, '0')}日`
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

test.describe('学校情報の編集', () => {
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 2-1 学校名（通称）の編集 =====
  test('2-1 学校名（通称）の編集', async ({ page }) => {
    const testNumber = '2-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    const dateStr = getDateStr()
    
    try {
      // ログインをする
      await login(page, loginId, password)

      // １　画面内の要素から、E2E中学校_二学期制の編集ボタンを探し選択する
      console.log('E2E中学校_二学期制の編集ボタンを探しています...')
      
      const schoolName = 'E2E中学校_二学期制'
      const schoolElement = page.getByText(schoolName, { exact: false }).first()
      await schoolElement.waitFor({ timeout: 10000 })
      
      const schoolSection = schoolElement.locator('xpath=ancestor::div[@data-testid="schools-accordion-content"]')
      const hasSection = await schoolSection.count() > 0
      
      let foundEditButton
      if (hasSection) {
        foundEditButton = schoolSection.getByRole('button', { name: '編集' }).first()
      } else {
        const parentSection = schoolElement.locator('xpath=ancestor::div[contains(@class, "relative")]')
        foundEditButton = parentSection.getByRole('button', { name: '編集' }).first()
      }
      
      await foundEditButton.waitFor({ timeout: 10000 })
      console.log('編集ボタンを見つけました')
      await foundEditButton.click()
      
      await page.waitForTimeout(2000)

      // ２　編集ダイアログが表示され、ダイアログの通称テキスト欄（一番上のテキスト入力欄）に既に入力された文字列＋実施日の年月日を入力する
      console.log('編集ダイアログの表示を待機中...')
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ timeout: 10000 })
      
      const commonNameField = page.getByLabel('通称')
      await commonNameField.waitFor({ timeout: 10000 })
      
      const currentValue = await commonNameField.inputValue()
      console.log(`現在の通称値: ${currentValue}`)
      
      const newValue = `${currentValue}${dateStr}`
      await commonNameField.clear()
      await commonNameField.fill(newValue)
      console.log(`新しい通称値: ${newValue}`)
      
      await page.waitForTimeout(2000)

      // ３　ダイアログ内の要素から保存ボタンを探し選択する
      console.log('保存ボタンを探しています...')
      const saveButton = dialog.getByRole('button', { name: '保存' }).first()
      await saveButton.waitFor({ timeout: 10000 })
      await saveButton.click()
      
      await page.waitForTimeout(2000)

      // ４　ダイアログが閉じたら、キャプチャの撮影をする
      console.log('ダイアログが閉じるのを待機中...')
      try {
        await page.waitForResponse(response => 
          response.url().includes('/schools/') && response.request().method() === 'PUT',
          { timeout: 10000 }
        ).catch(() => {})
      } catch (e) {}
      
      try {
        await dialog.waitFor({ state: 'hidden', timeout: 15000 })
      } catch (e) {
        const dialogCount = await page.getByRole('dialog').count()
        if (dialogCount === 0) {
          console.log('ダイアログは既に閉じられています')
        } else {
          await page.waitForTimeout(3000)
        }
      }
      
      await page.waitForTimeout(2000)
      const now1 = new Date()
      const timeStr1 = `${String(now1.getHours()).padStart(2, '0')}${String(now1.getMinutes()).padStart(2, '0')}${String(now1.getSeconds()).padStart(2, '0')}`
      const capturePath1 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr1}_after_save.png`)
      await page.screenshot({ path: capturePath1, fullPage: true })
      console.log(`✓ 保存後のキャプチャを保存しました: ${capturePath1}`)

      // ５　手順1を再度行い、手順２で追加した、実施日の年月日の記述だけ削除する
      console.log('再度編集ボタンをクリック中...')
      await foundEditButton.waitFor({ timeout: 10000 })
      await foundEditButton.click()
      
      await page.waitForTimeout(2000)

      await dialog.waitFor({ timeout: 10000 })
      
      const currentValue2 = await commonNameField.inputValue()
      console.log(`現在の通称値（2回目）: ${currentValue2}`)
      
      const newValue2 = currentValue2.replace(dateStr, '')
      await commonNameField.clear()
      await commonNameField.fill(newValue2)
      console.log(`実施日の年月日を削除後の通称値: ${newValue2}`)
      
      await page.waitForTimeout(2000)

      await saveButton.click()
      
      await page.waitForTimeout(2000)

      // ６　手順４を実施する（ダイアログが閉じたら、キャプチャの撮影をする）
      console.log('ダイアログが閉じるのを待機中（2回目）...')
      try {
        await page.waitForResponse(response => 
          response.url().includes('/schools/') && response.request().method() === 'PUT',
          { timeout: 10000 }
        ).catch(() => {})
      } catch (e) {}
      
      try {
        await dialog.waitFor({ state: 'hidden', timeout: 15000 })
      } catch (e) {
        const dialogCount = await page.getByRole('dialog').count()
        if (dialogCount === 0) {
          console.log('ダイアログは既に閉じられています（2回目）')
        } else {
          await page.waitForTimeout(3000)
        }
      }
      
      await page.waitForTimeout(2000)
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_after_delete.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ 削除後のキャプチャを保存しました: ${capturePath2}`)
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
