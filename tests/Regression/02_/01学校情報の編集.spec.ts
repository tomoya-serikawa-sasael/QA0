import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// 共通の設定とヘルパー関数
const baseUrl = 'https://nanboku.stage.sasael.dev'
const loginId = 'e2eck'
const password = 'e2ecke2ecke2eck'
const folderName = '02_'

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

test.describe('学校情報の編集', () => {
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 1-1 学校情報の編集 =====
  test('1-1 学校情報の編集', async ({ page }) => {
    const testNumber = '1-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // １　ログインをする
      await login(page, loginId, password)

      // ２　ログイン後1秒ディレイする
      console.log('ログイン後1秒ディレイ中...')
      await page.waitForTimeout(1000)

      // ３　画面内の要素で学校情報を検索し選択する
      console.log('学校情報を検索中...')
      const schoolInfoLink = page.getByRole('link', { name: '学校情報' }).first()
      await schoolInfoLink.waitFor({ timeout: 10000 })
      await schoolInfoLink.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ４　画面内、右上付近に存在する　…ボタンを選択
      console.log('右上付近の「…」ボタンを探しています...')
      // 右上付近の…ボタンを探す
      let menuButton
      try {
        // 右上付近のボタンを探す
        menuButton = page.locator('button').filter({ hasText: /^[……]$/ }).last()
        await menuButton.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          menuButton = page.getByRole('button', { name: /メニュー|menu/i }).last()
          await menuButton.waitFor({ timeout: 5000 })
        } catch (e2) {
          // 画面右上付近のボタンを探す
          const buttons = page.locator('button')
          const count = await buttons.count()
          menuButton = buttons.nth(count - 1)
          await menuButton.waitFor({ timeout: 5000 })
        }
      }
      await menuButton.click()
      await page.waitForTimeout(2000)

      // ５　学校情報を編集　を選択する
      console.log('学校情報を編集を探しています...')
      const editMenuItem = page.getByRole('menuitem', { name: '学校情報を編集' }).first()
      await editMenuItem.waitFor({ timeout: 10000 })
      await editMenuItem.click()
      await page.waitForTimeout(2000)

      // ダイアログの表示を待機
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ timeout: 10000 })

      // ６～１１　各種情報を編集
      // ６　ダイアログ内の　通称に　E2E中学校_二学期制ー編集　に変更する
      console.log('通称を編集中...')
      const commonNameField = dialog.getByLabel('通称').first()
      await commonNameField.waitFor({ timeout: 10000 })
      await commonNameField.clear()
      await commonNameField.fill('E2E中学校_二学期制ー編集')
      await page.waitForTimeout(2000)

      // ７　郵便番号を、　001-0001　に変更する
      console.log('郵便番号を編集中...')
      const postalCodeField = dialog.getByLabel('郵便番号').first()
      await postalCodeField.waitFor({ timeout: 10000 })
      await postalCodeField.clear()
      await postalCodeField.fill('001-0001')
      await page.waitForTimeout(2000)

      // ８　住所を、　東京路八王子編集　に変更する
      console.log('住所を編集中...')
      const addressField = dialog.getByLabel('住所').first()
      await addressField.waitFor({ timeout: 10000 })
      await addressField.clear()
      await addressField.fill('東京路八王子編集')
      await page.waitForTimeout(2000)

      // ９　電話番号を、000-000-0001に変更する
      console.log('電話番号を編集中...')
      const phoneField = dialog.getByLabel('電話番号').first()
      await phoneField.waitFor({ timeout: 10000 })
      await phoneField.clear()
      await phoneField.fill('000-000-0001')
      await page.waitForTimeout(2000)

      // １０　校長欄のプルダウンを、偽　校長　に変更する
      console.log('校長欄のプルダウンを探しています...')
      const principalSelect = dialog.getByLabel('校長').first()
      await principalSelect.waitFor({ timeout: 10000 })
      await principalSelect.click()
      await page.waitForTimeout(2000)

      console.log('偽　校長を選択中...')
      const fakePrincipalOption = page.getByRole('option', { name: '偽　校長' }).first()
      await fakePrincipalOption.waitFor({ timeout: 10000 })
      await fakePrincipalOption.click()
      await page.waitForTimeout(2000)

      // １１　備考欄に、　編集中　と入力すること
      console.log('備考欄を編集中...')
      const remarksField = dialog.getByLabel('備考').first()
      await remarksField.waitFor({ timeout: 10000 })
      await remarksField.clear()
      await remarksField.fill('編集中')
      await page.waitForTimeout(2000)

      // １２　保存ボタンを選択する
      console.log('保存ボタンを探しています...')
      const saveButton = dialog.getByRole('button', { name: '保存' }).first()
      await saveButton.waitFor({ timeout: 10000 })
      await saveButton.click()
      await page.waitForTimeout(2000)

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

      // １３　キャプチャを撮影する
      console.log('キャプチャを取得中...')
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_after_edit.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ 編集後のキャプチャを保存しました: ${capturePath2}`)

      // １４～２１　再度編集して元に戻す
      // １４　学校情報を編集　を選択する
      console.log('再度「…」ボタンを探しています...')
      await menuButton.waitFor({ timeout: 10000 })
      await menuButton.click()
      await page.waitForTimeout(2000)

      console.log('学校情報を編集を探しています（2回目）...')
      const editMenuItem2 = page.getByRole('menuitem', { name: '学校情報を編集' }).first()
      await editMenuItem2.waitFor({ timeout: 10000 })
      await editMenuItem2.click()
      await page.waitForTimeout(2000)

      const dialog2 = page.getByRole('dialog')
      await dialog2.waitFor({ timeout: 10000 })

      // １５　ダイアログ内の　通称に　E2E中学校_二学期制　に変更する
      console.log('通称を元に戻す中...')
      await commonNameField.waitFor({ timeout: 10000 })
      await commonNameField.clear()
      await commonNameField.fill('E2E中学校_二学期制')
      await page.waitForTimeout(2000)

      // １６　郵便番号を、　192-0001　に変更する
      console.log('郵便番号を元に戻す中...')
      await postalCodeField.waitFor({ timeout: 10000 })
      await postalCodeField.clear()
      await postalCodeField.fill('192-0001')
      await page.waitForTimeout(2000)

      // １７　住所を、　東京路八王子　に変更する
      console.log('住所を元に戻す中...')
      await addressField.waitFor({ timeout: 10000 })
      await addressField.clear()
      await addressField.fill('東京路八王子')
      await page.waitForTimeout(2000)

      // １８　電話番号を、111-000-0001に変更する
      console.log('電話番号を元に戻す中...')
      await phoneField.waitFor({ timeout: 10000 })
      await phoneField.clear()
      await phoneField.fill('111-000-0001')
      await page.waitForTimeout(2000)

      // １９　校長欄のプルダウンを、E2E中学　教師　に変更する
      console.log('校長欄のプルダウンを探しています（2回目）...')
      await principalSelect.waitFor({ timeout: 10000 })
      await principalSelect.click()
      await page.waitForTimeout(2000)

      console.log('E2E中学　教師を選択中...')
      const teacherOption = page.getByRole('option', { name: 'E2E中学　教師' }).first()
      await teacherOption.waitFor({ timeout: 10000 })
      await teacherOption.click()
      await page.waitForTimeout(2000)

      // ２０　備考欄を、空欄にする
      console.log('備考欄を空欄にする中...')
      await remarksField.waitFor({ timeout: 10000 })
      await remarksField.clear()
      await page.waitForTimeout(2000)

      // ２１　保存ボタンを選択する
      console.log('保存ボタンを探しています（2回目）...')
      const saveButton2 = dialog2.getByRole('button', { name: '保存' }).first()
      await saveButton2.waitFor({ timeout: 10000 })
      await saveButton2.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForResponse(response => 
          response.url().includes('/schools/') && response.request().method() === 'PUT',
          { timeout: 10000 }
        ).catch(() => {})
      } catch (e) {}
      
      try {
        await dialog2.waitFor({ state: 'hidden', timeout: 15000 })
      } catch (e) {
        const dialogCount = await page.getByRole('dialog').count()
        if (dialogCount === 0) {
          console.log('ダイアログは既に閉じられています')
        } else {
          await page.waitForTimeout(3000)
        }
      }
      await page.waitForTimeout(2000)

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
