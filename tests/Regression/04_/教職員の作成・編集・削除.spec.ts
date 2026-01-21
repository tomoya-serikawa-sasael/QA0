import { test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

// 共通の設定とヘルパー関数
const baseUrl = 'https://nanboku.stage.sasael.dev'
const loginId = 'j0001'
const password = 'j0001j0001j0001'
const folderName = '04_'

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

test.describe('教職員の作成・編集・削除', () => {
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 4-1 自治体職員の作成・編集・削除 =====
  test('4-1 自治体職員の作成・編集・削除', async ({ page }) => {
    const testNumber = '4-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // １　ログインをする
      await login(page, loginId, password)

      // ２　画面内の要素から、教職員名簿を探し選択する
      console.log('教職員名簿を探しています...')
      const staffsLink = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink.waitFor({ timeout: 10000 })
      await staffsLink.click()
      
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      
      await page.waitForTimeout(2000)

      // ３　画面内の要素から、教職員を登録ボタンを選択
      console.log('教職員を登録ボタンを探しています...')
      const registerButton = page.getByRole('button', { name: '教職員を登録' }).first()
      await registerButton.waitFor({ timeout: 10000 })
      await registerButton.click()
      
      await page.waitForTimeout(2000)

      // ４　以降の入力欄の手順は、ダイアログ内の要素から探し選択する
      console.log('登録ダイアログの表示を待機中...')
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ timeout: 10000 })

      // ５～１４　教職員情報の入力
      console.log('通称・姓の入力欄を探しています...')
      const lastNameField = dialog.getByLabel('通称・姓').first()
      await lastNameField.waitFor({ timeout: 10000 })
      await lastNameField.click()
      await lastNameField.fill('カーソル')
      await page.waitForTimeout(2000)

      console.log('通称・名の入力欄を探しています...')
      const firstNameField = dialog.getByLabel('通称・名').first()
      await firstNameField.waitFor({ timeout: 10000 })
      await firstNameField.click()
      await firstNameField.fill('太郎')
      await page.waitForTimeout(2000)

      console.log('通称・姓（カナ）の入力欄を探しています...')
      const lastNameKanaField = dialog.getByLabel('通称・姓（カナ）').first()
      await lastNameKanaField.waitFor({ timeout: 10000 })
      await lastNameKanaField.click()
      await lastNameKanaField.fill('カーソル')
      await page.waitForTimeout(2000)

      console.log('通称・名（カナ）の入力欄を探しています...')
      const firstNameKanaField = dialog.getByLabel('通称・名（カナ）').first()
      await firstNameKanaField.waitFor({ timeout: 10000 })
      await firstNameKanaField.click()
      await firstNameKanaField.fill('タロウ')
      await page.waitForTimeout(2000)

      console.log('役割プルダウンを探しています...')
      const roleSelect = dialog.getByLabel('役割').first()
      await roleSelect.waitFor({ timeout: 10000 })
      await roleSelect.click()
      await page.waitForTimeout(2000)

      console.log('自治体権限_閲覧を選択中...')
      const roleOption = page.getByRole('option', { name: '自治体権限_閲覧' }).first()
      await roleOption.waitFor({ timeout: 10000 })
      await roleOption.click()
      await page.waitForTimeout(2000)

      console.log('Tabキーを3回押してチェックボックスに移動中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)

      console.log('SasaeL IDを作成してログインのチェックボックスを有効化中...')
      const createIdCheckbox = dialog.getByLabel('SasaeL IDを作成してログイン').first()
      await createIdCheckbox.waitFor({ timeout: 10000 })
      const isChecked = await createIdCheckbox.isChecked()
      if (!isChecked) {
        await page.keyboard.press('Space')
      }
      await page.waitForTimeout(2000)

      console.log('ログインIDの入力欄を探しています...')
      const loginIdField = dialog.getByLabel('ログインID').first()
      await loginIdField.waitFor({ timeout: 10000 })
      await loginIdField.click()
      await loginIdField.fill('cursor1')
      await page.waitForTimeout(2000)

      console.log('パスワードの入力欄を探しています...')
      const passwordField = dialog.getByLabel('パスワード').first()
      await passwordField.waitFor({ timeout: 10000 })
      await passwordField.click()
      await passwordField.fill('cursor1cursor1cursor1')
      await page.waitForTimeout(2000)

      console.log('パスワード（再入力）の入力欄を探しています...')
      const passwordConfirmField = dialog.getByLabel('パスワード（再入力）').first()
      await passwordConfirmField.waitFor({ timeout: 10000 })
      await passwordConfirmField.click()
      await passwordConfirmField.fill('cursor1cursor1cursor1')
      await page.waitForTimeout(2000)

      console.log('登録ボタンを探しています...')
      const submitButton = dialog.getByRole('button', { name: '登録' }).first()
      await submitButton.waitFor({ timeout: 10000 })
      await submitButton.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForResponse(response => 
          response.url().includes('/staffs') && (response.request().method() === 'POST' || response.request().method() === 'PUT'),
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

      // １５　キャプチャの作成
      console.log('キャプチャを取得中...')
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const capturePath = path.join(dateFolder, `${folderName}${testNumber}_${timeStr}.png`)
      await page.screenshot({ path: capturePath, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath}`)

      // １６～２２　ログアウト→新規ユーザーでログイン→ツールチップ確認→ログアウト→元のユーザーでログイン
      console.log('サイドメニュー内の「自治体 編集」を探しています...')
      const editButton = page.getByLabel('自治体 編集').first()
      await editButton.waitFor({ timeout: 10000 })
      await editButton.click()
      await page.waitForTimeout(2000)

      await page.waitForTimeout(1000)
      console.log('ログアウトを探しています...')
      const logoutMenuItem = page.getByRole('menuitem', { name: 'ログアウト' }).first()
      await logoutMenuItem.waitFor({ timeout: 10000 })
      await logoutMenuItem.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForURL(/\/login/, { timeout: 5000 })
        console.log(`✓ ログインページに遷移しました: ${page.url()}`)
      } catch (e) {
        console.log(`現在のURL: ${page.url()}`)
        if (!page.url().includes('/login')) {
          console.log('ログインページに遷移していません。手動で遷移します...')
          await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
          await page.waitForTimeout(1000)
        }
      }

      await page.waitForTimeout(1000)
      console.log('新規作成したユーザーでログイン中...')
      await login(page, 'cursor1', 'cursor1cursor1cursor1')

      console.log('サイドメニュー内の「カーソル 太郎」を探してホバー中...')
      let hoverElement
      try {
        hoverElement = page.getByLabel('カーソル 太郎').first()
        await hoverElement.waitFor({ timeout: 10000 })
      } catch (e) {
        try {
          hoverElement = page.locator('nav button, aside button').filter({ hasText: 'カーソル 太郎' }).first()
          await hoverElement.waitFor({ timeout: 5000 })
        } catch (e2) {
          hoverElement = page.getByText('カーソル 太郎', { exact: false }).first()
          await hoverElement.waitFor({ timeout: 5000 })
        }
      }
      await hoverElement.hover()
      await page.waitForTimeout(2000)
      await page.waitForTimeout(1000)

      console.log('キャプチャを取得中...')
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_tooltip.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath2}`)

      console.log('サイドメニュー内の「カーソル 太郎」を探しています...')
      let userButton
      try {
        userButton = page.getByLabel('カーソル 太郎').first()
        await userButton.waitFor({ timeout: 10000 })
      } catch (e) {
        userButton = page.locator('nav button, aside button').filter({ hasText: 'カーソル 太郎' }).first()
        await userButton.waitFor({ timeout: 10000 })
      }
      await userButton.click()
      await page.waitForTimeout(2000)

      await page.waitForTimeout(1000)
      console.log('ログアウトを探しています（2回目）...')
      const logoutMenuItem2 = page.getByRole('menuitem', { name: 'ログアウト' }).first()
      await logoutMenuItem2.waitFor({ timeout: 10000 })
      await logoutMenuItem2.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForURL(/\/login/, { timeout: 5000 })
        console.log(`✓ ログインページに遷移しました: ${page.url()}`)
      } catch (e) {
        console.log(`現在のURL: ${page.url()}`)
        if (!page.url().includes('/login')) {
          console.log('ログインページに遷移していません。手動で遷移します...')
          await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 })
          await page.waitForTimeout(1000)
        }
      }

      await page.waitForTimeout(1000)
      console.log('元のユーザー（j0001）でログイン中...')
      await login(page, loginId, password)

      // ２３～２８　教職員の編集
      console.log('教職員名簿を探しています（2回目）...')
      const staffsLink2 = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink2.waitFor({ timeout: 10000 })
      await staffsLink2.click()
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      await page.waitForTimeout(2000)

      console.log('「カーソル 太郎」の列の「…」ボタンを探しています...')
      let cursorTaroRow
      try {
        cursorTaroRow = page.locator('tr').filter({ hasText: 'カーソル編集 太郎' }).first()
        await cursorTaroRow.waitFor({ timeout: 5000 })
      } catch (e) {
        cursorTaroRow = page.locator('tr').filter({ hasText: 'カーソル 太郎' }).first()
        await cursorTaroRow.waitFor({ timeout: 10000 })
      }
      
      let menuButton
      try {
        menuButton = cursorTaroRow.getByRole('button', { name: /^[……]$/ }).first()
        await menuButton.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          menuButton = cursorTaroRow.getByRole('button', { name: /メニュー|menu/i }).first()
          await menuButton.waitFor({ timeout: 5000 })
        } catch (e2) {
          menuButton = cursorTaroRow.locator('button').last()
          await menuButton.waitFor({ timeout: 5000 })
        }
      }
      await menuButton.click()
      await page.waitForTimeout(2000)

      console.log('編集を探しています...')
      const editMenuItem = page.getByRole('menuitem', { name: '編集' }).first()
      await editMenuItem.waitFor({ timeout: 10000 })
      await editMenuItem.click()
      await page.waitForTimeout(2000)

      const editDialog = page.getByRole('dialog')
      await editDialog.waitFor({ timeout: 10000 })

      console.log('通称・姓の入力欄を探しています（編集）...')
      const lastNameFieldEdit = editDialog.getByLabel('通称・姓').first()
      await lastNameFieldEdit.waitFor({ timeout: 10000 })
      await lastNameFieldEdit.click()
      await lastNameFieldEdit.clear()
      await lastNameFieldEdit.fill('カーソル編集')
      await page.waitForTimeout(2000)

      console.log('保存ボタンを探しています（編集）...')
      const saveButtonEdit = editDialog.getByRole('button', { name: '保存' }).first()
      await saveButtonEdit.waitFor({ timeout: 10000 })
      await saveButtonEdit.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForResponse(response => 
          response.url().includes('/staffs') && response.request().method() === 'PUT',
          { timeout: 10000 }
        ).catch(() => {})
      } catch (e) {}
      
      try {
        await editDialog.waitFor({ state: 'hidden', timeout: 15000 })
      } catch (e) {
        const dialogCount = await page.getByRole('dialog').count()
        if (dialogCount === 0) {
          console.log('ダイアログは既に閉じられています')
        } else {
          await page.waitForTimeout(3000)
        }
      }
      await page.waitForTimeout(2000)

      console.log('キャプチャを取得中（編集後）...')
      const now3 = new Date()
      const timeStr3 = `${String(now3.getHours()).padStart(2, '0')}${String(now3.getMinutes()).padStart(2, '0')}${String(now3.getSeconds()).padStart(2, '0')}`
      const capturePath3 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr3}_after_edit.png`)
      await page.screenshot({ path: capturePath3, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath3}`)

      // ２９～３２　教職員の削除
      console.log('「カーソル 太郎」の列の「…」ボタンを再度探しています...')
      let cursorTaroRow2
      try {
        cursorTaroRow2 = page.locator('tr').filter({ hasText: 'カーソル編集 太郎' }).first()
        await cursorTaroRow2.waitFor({ timeout: 5000 })
      } catch (e) {
        cursorTaroRow2 = page.locator('tr').filter({ hasText: 'カーソル 太郎' }).first()
        await cursorTaroRow2.waitFor({ timeout: 10000 })
      }
      
      let menuButton2
      try {
        menuButton2 = cursorTaroRow2.getByRole('button', { name: /^[……]$/ }).first()
        await menuButton2.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          menuButton2 = cursorTaroRow2.getByRole('button', { name: /メニュー|menu/i }).first()
          await menuButton2.waitFor({ timeout: 5000 })
        } catch (e2) {
          menuButton2 = cursorTaroRow2.locator('button').last()
          await menuButton2.waitFor({ timeout: 5000 })
        }
      }
      await menuButton2.click()
      await page.waitForTimeout(2000)

      console.log('削除を探しています...')
      const deleteMenuItem = page.getByRole('menuitem', { name: '削除' }).first()
      await deleteMenuItem.waitFor({ timeout: 10000 })
      await deleteMenuItem.click()
      await page.waitForTimeout(2000)

      console.log('削除ダイアログの表示を待機中...')
      const deleteDialog = page.getByRole('dialog')
      await deleteDialog.waitFor({ timeout: 10000 })
      
      console.log('Tab操作を2回行い、↓キー操作を1回行って「完全に削除する」にフォーカスを移動中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(500)
      await page.waitForTimeout(2000)

      console.log('削除ボタンを探しています...')
      const confirmDeleteButton = deleteDialog.getByRole('button', { name: '削除' }).first()
      await confirmDeleteButton.waitFor({ timeout: 10000 })
      await confirmDeleteButton.click()
      await page.waitForTimeout(2000)

      try {
        await page.waitForResponse(response => 
          response.url().includes('/staffs') && response.request().method() === 'DELETE',
          { timeout: 10000 }
        ).catch(() => {})
      } catch (e) {}
      
      try {
        await deleteDialog.waitFor({ state: 'hidden', timeout: 15000 })
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
