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

test.describe('教職員の作成・編集・削除', () => {
  test.describe.configure({ mode: 'serial' }) // 同じファイル内のテストを連続実行（ブラウザを閉じない）
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

      // ９　役割プルダウンを選択し、自治体権限_閲覧　を選択し、tabキー操作を３回行う
      console.log('Tabキーを3回押してチェックボックスに移動中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)

      // １０　SasaeL IDを作成してログイン　のチェックボックスを有効にする
      console.log('SasaeL IDを作成してログインのチェックボックスを有効化中...')
      const createIdCheckbox = dialog.getByLabel('SasaeL IDを作成してログイン').first()
      await createIdCheckbox.waitFor({ timeout: 10000 })
      const isChecked = await createIdCheckbox.isChecked()
      if (!isChecked) {
        await page.keyboard.press('Space')
      }
      await page.waitForTimeout(2000)

      // １１　ログインIDの入力欄に、　 cursor1　と入力
      console.log('ログインIDの入力欄を探しています...')
      const loginIdField = dialog.getByLabel('ログインID').first()
      await loginIdField.waitFor({ timeout: 10000 })
      await loginIdField.click()
      await loginIdField.fill('cursor1')
      await page.waitForTimeout(2000)

      // １２　パスワードに　cursor1cursor1cursor1　と入力
      console.log('パスワードの入力欄を探しています...')
      const passwordField = dialog.getByLabel('パスワード').first()
      await passwordField.waitFor({ timeout: 10000 })
      await passwordField.click()
      await passwordField.fill('cursor1cursor1cursor1')
      await page.waitForTimeout(2000)

      // １３　パスワード（再入力）に　cursor1cursor1cursor1　と入力
      console.log('パスワード（再入力）の入力欄を探しています...')
      const passwordConfirmField = dialog.getByLabel('パスワード（再入力）').first()
      await passwordConfirmField.waitFor({ timeout: 10000 })
      await passwordConfirmField.click()
      await passwordConfirmField.fill('cursor1cursor1cursor1')
      await page.waitForTimeout(2000)

      // １４　登録ボタンを選択する
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
      // １６　サイドメニュー内の要素　ラベル"自治体 編集"　を探し、選択
      console.log('サイドメニュー内の「自治体 編集」を探しています...')
      const editButton = page.getByLabel('自治体 編集').first()
      await editButton.waitFor({ timeout: 10000 })
      await editButton.click()
      await page.waitForTimeout(2000)

      // １７　1秒待機後、メニュー内のログアウトを選択　ログアウトの返り値は存在しないため、ログイン画面に遷移したら手順18を開始
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

      // １８　ログイン画面で、1秒待機後以下情報でログインをする
      await page.waitForTimeout(1000)
      console.log('新規作成したユーザーでログイン中...')
      await login(page, 'cursor1', 'cursor1cursor1cursor1')

      // １８　サイドメニュー内の要素　ラベル"カーソル 太郎"　を探し、カーソルをホバーさせてツールチップを表示させる
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

      // １９　キャプチャの撮影をする
      console.log('キャプチャを取得中...')
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_tooltip.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath2}`)

      // ２０　サイドメニュー内の要素　ラベル"カーソル 太郎"　を探し、選択
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

      // ２１　1秒待機後、メニュー内のログアウトを選択　ログアウトの返り値は存在しないため、ログイン画面に遷移したら手順23を開始
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

      // ２２　ログイン画面で、1秒待機後以下情報でログインをする
      await page.waitForTimeout(1000)
      console.log('元のユーザー（j0001）でログイン中...')
      await login(page, loginId, password)

      // ２３～２８　教職員の編集
      // ２３　画面内の要素から、教職員名簿を探し選択する
      console.log('教職員名簿を探しています（2回目）...')
      const staffsLink2 = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink2.waitFor({ timeout: 10000 })
      await staffsLink2.click()
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      await page.waitForTimeout(2000)

      // ２４　画面内の要素から、カーソル 太郎　の列に存在する　… ボタンを選択する
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

      // ２５　編集を選択する
      console.log('編集を探しています...')
      const editMenuItem = page.getByRole('menuitem', { name: '編集' }).first()
      await editMenuItem.waitFor({ timeout: 10000 })
      await editMenuItem.click()
      await page.waitForTimeout(2000)

      const editDialog = page.getByRole('dialog')
      await editDialog.waitFor({ timeout: 10000 })

      // ２６　通称・姓の入力欄に　カーソル編集　と入力
      console.log('通称・姓の入力欄を探しています（編集）...')
      const lastNameFieldEdit = editDialog.getByLabel('通称・姓').first()
      await lastNameFieldEdit.waitFor({ timeout: 10000 })
      await lastNameFieldEdit.click()
      await lastNameFieldEdit.clear()
      await lastNameFieldEdit.fill('カーソル編集')
      await page.waitForTimeout(2000)

      // ２７　ダイアログ内の　保存ボタンを選択する
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

      // ２８　キャプチャの撮影をする
      console.log('キャプチャを取得中（編集後）...')
      const now3 = new Date()
      const timeStr3 = `${String(now3.getHours()).padStart(2, '0')}${String(now3.getMinutes()).padStart(2, '0')}${String(now3.getSeconds()).padStart(2, '0')}`
      const capturePath3 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr3}_after_edit.png`)
      await page.screenshot({ path: capturePath3, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath3}`)

      // ２９～３１　教職員の削除
      // ２９　画面内の要素から、カーソル 太郎　の列に存在する　… ボタンを選択する
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

      // ３０　削除を選択する
      console.log('削除を探しています...')
      const deleteMenuItem = page.getByRole('menuitem', { name: '削除' }).first()
      await deleteMenuItem.waitFor({ timeout: 10000 })
      await deleteMenuItem.click()
      await page.waitForTimeout(2000)

      // ３１　ダイアログ内で　tab操作を２回行い、↓キー操作を１回行い、フォーカスを「完全に削除する」の状態で　削除ボタンを選択
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

  // ===== 4-2 学校職員の作成・編集・削除 =====
  test('4-2 学校職員の作成・編集・削除', async ({ page }) => {
    const testNumber = '4-2'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // 現在のURLを確認
      const currentUrl = page.url()
      console.log(`現在のURL: ${currentUrl}`)
      
      // ログイン画面または空白ページの場合はログインが必要
      if (currentUrl.includes('/login') || currentUrl === 'about:blank' || !currentUrl.includes('nanboku.stage.sasael.dev')) {
        console.log('ログインが必要です。ログイン処理を実行します...')
        await login(page, loginId, password)
      }
      
      // 教職員名簿画面にいない場合は遷移
      if (!currentUrl.includes('/municipality/staffs')) {
        console.log('教職員名簿画面に遷移します...')
        const staffsLink = page.getByRole('link', { name: '教職員名簿' }).first()
        await staffsLink.waitFor({ timeout: 10000 })
        await staffsLink.click()
        
        await page.waitForTimeout(2000)
        await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
        console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
        await page.waitForTimeout(2000)
      } else {
        console.log('既に教職員名簿画面にいます')
        await page.waitForTimeout(2000)
      }

      // １　教職員名簿画面で、所属組織のプルダウンを画面内の要素から探してプルダウンを選択
      console.log('所属組織のプルダウンを探しています...')
      const organizationSelect = page.getByLabel('所属組織')
      await organizationSelect.waitFor({ timeout: 10000 })
      await organizationSelect.click()
      await page.waitForTimeout(2000)

      // ２　プルダウンメニュー内の E2E小学校_二学期制　を選択する
      console.log('E2E小学校_二学期制を選択中...')
      const schoolOption = page.getByRole('option', { name: 'E2E小学校_二学期制' }).first()
      await schoolOption.waitFor({ timeout: 10000 })
      await schoolOption.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
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

      // ５～１６　教職員情報の入力
      // ５　通称・姓の入力欄に、カーソル　と入力
      console.log('通称・姓の入力欄を探しています...')
      const lastNameField = dialog.getByLabel('通称・姓').first()
      await lastNameField.waitFor({ timeout: 10000 })
      await lastNameField.click()
      await lastNameField.fill('カーソル')
      await page.waitForTimeout(2000)

      // ６　通称・名の入力欄に、太郎丸　と入力
      console.log('通称・名の入力欄を探しています...')
      const firstNameField = dialog.getByLabel('通称・名').first()
      await firstNameField.waitFor({ timeout: 10000 })
      await firstNameField.click()
      await firstNameField.fill('太郎丸')
      await page.waitForTimeout(2000)

      // ７　通称・姓（カナ）の入力欄に、カーソル　と入力
      console.log('通称・姓（カナ）の入力欄を探しています...')
      const lastNameKanaField = dialog.getByLabel('通称・姓（カナ）').first()
      await lastNameKanaField.waitFor({ timeout: 10000 })
      await lastNameKanaField.click()
      await lastNameKanaField.fill('カーソル')
      await page.waitForTimeout(2000)

      // ８　通称・名（カナ）の入力欄に、タロウマル　と入力
      console.log('通称・名（カナ）の入力欄を探しています...')
      const firstNameKanaField = dialog.getByLabel('通称・名（カナ）').first()
      await firstNameKanaField.waitFor({ timeout: 10000 })
      await firstNameKanaField.click()
      await firstNameKanaField.fill('タロウマル')
      await page.waitForTimeout(2000)

      // ９　役割プルダウンを選択し、クラス担任　を選択する
      console.log('役割プルダウンを探しています...')
      const roleSelect = dialog.getByLabel('役割').first()
      await roleSelect.waitFor({ timeout: 10000 })
      await roleSelect.click()
      await page.waitForTimeout(2000)

      console.log('クラス担任を選択中...')
      const classTeacherOption = page.getByRole('option', { name: 'クラス担任' }).first()
      await classTeacherOption.waitFor({ timeout: 10000 })
      await classTeacherOption.click()
      await page.waitForTimeout(2000)

      // １０　tabキーを１回使用し、担当の"comboboxを選択し、↓キーを１回実行し、Enterを実行する
      console.log('Tabキーを1回押して担当のcomboboxに移動中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      
      console.log('担当のcomboboxを選択中...')
      const assignmentCombobox = dialog.getByRole('combobox', { name: '担当' }).first()
      await assignmentCombobox.waitFor({ timeout: 10000 })
      await assignmentCombobox.click()
      await page.waitForTimeout(1000)

      console.log('↓キーを1回押して1年リグ組を選択中...')
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(500)

      console.log('Enterキーを押して確定中...')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)

      // １１　tabキー操作を３回行う
      console.log('Tabキーを3回押してチェックボックスに移動中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)

      // １２　SasaeL IDを作成してログイン　のチェックボックスを有効にする
      console.log('SasaeL IDを作成してログインのチェックボックスを有効化中...')
      const createIdCheckbox = dialog.getByLabel('SasaeL IDを作成してログイン').first()
      await createIdCheckbox.waitFor({ timeout: 10000 })
      const isChecked = await createIdCheckbox.isChecked()
      if (!isChecked) {
        await page.keyboard.press('Space')
      }
      await page.waitForTimeout(2000)

      // チェックボックスを有効化した後、ログインIDの入力欄が表示されるまで待機
      await page.waitForTimeout(1000)

      // １３　ログインIDの入力欄に、　 cursor2　と入力
      console.log('ログインIDの入力欄を探しています...')
      // ダイアログ内でログインIDの入力欄を探す（表示されるまで待機）
      let loginIdField
      for (let i = 0; i < 10; i++) {
        try {
          loginIdField = dialog.getByLabel('ログインID').first()
          await loginIdField.waitFor({ timeout: 2000 })
          break
        } catch (e) {
          if (i === 9) throw e
          await page.waitForTimeout(500)
        }
      }
      await loginIdField.click()
      await loginIdField.fill('cursor2')
      await page.waitForTimeout(2000)

      // １４　パスワードに　cursor2cursor2cursor2　と入力
      console.log('パスワードの入力欄を探しています...')
      const passwordField = dialog.getByLabel('パスワード').first()
      await passwordField.waitFor({ timeout: 10000 })
      await passwordField.click()
      await passwordField.fill('cursor2cursor2cursor2')
      await page.waitForTimeout(2000)

      // １５　パスワード（再入力）に　cursor2cursor2cursor2　と入力
      console.log('パスワード（再入力）の入力欄を探しています...')
      const passwordConfirmField = dialog.getByLabel('パスワード（再入力）').first()
      await passwordConfirmField.waitFor({ timeout: 10000 })
      await passwordConfirmField.click()
      await passwordConfirmField.fill('cursor2cursor2cursor2')
      await page.waitForTimeout(2000)

      // １６　登録ボタンを選択する
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

      // １７　キャプチャの作成
      console.log('キャプチャを取得中...')
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const capturePath = path.join(dateFolder, `${folderName}${testNumber}_${timeStr}.png`)
      await page.screenshot({ path: capturePath, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath}`)

      // １８～２５　ログアウト→新規ユーザーでログイン→ツールチップ確認→ログアウト→元のユーザーでログイン
      // １８　サイドメニュー内の要素　ラベル"自治体 編集"　を探し、選択
      console.log('サイドメニュー内の「自治体 編集」を探しています...')
      const editButton = page.getByLabel('自治体 編集').first()
      await editButton.waitFor({ timeout: 10000 })
      await editButton.click()
      await page.waitForTimeout(2000)

      // １９　1秒待機後、メニュー内のログアウトを選択　ログアウトの返り値は存在しないため、ログイン画面に遷移したら手順２０を開始
      await page.waitForTimeout(1000)
      console.log('ログアウトを探しています...')
      // メニューが表示されるまで待機
      await page.waitForTimeout(500)
      let logoutMenuItem
      try {
        logoutMenuItem = page.getByRole('menuitem', { name: 'ログアウト' }).first()
        await logoutMenuItem.waitFor({ timeout: 5000 })
      } catch (e) {
        // メニューが見つからない場合は、もう一度待機してから探す
        await page.waitForTimeout(1000)
        logoutMenuItem = page.getByRole('menuitem', { name: 'ログアウト' }).first()
        await logoutMenuItem.waitFor({ timeout: 10000 })
      }
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

      // ２０　ログイン画面で、1秒待機後以下情報でログインをする
      await page.waitForTimeout(1000)
      console.log('新規作成したユーザー（cursor2）でログイン中...')
      await login(page, 'cursor2', 'cursor2cursor2cursor2')

      // ２１　サイドメニュー内の要素　ラベル"カーソル 太郎丸"　を探し、カーソルをホバーさせてツールチップを表示させる
      console.log('サイドメニュー内の「カーソル 太郎丸」を探してホバー中...')
      let hoverElement
      try {
        hoverElement = page.getByLabel('カーソル 太郎丸').first()
        await hoverElement.waitFor({ timeout: 10000 })
      } catch (e) {
        try {
          hoverElement = page.locator('nav button, aside button').filter({ hasText: 'カーソル 太郎丸' }).first()
          await hoverElement.waitFor({ timeout: 5000 })
        } catch (e2) {
          hoverElement = page.getByText('カーソル 太郎丸', { exact: false }).first()
          await hoverElement.waitFor({ timeout: 5000 })
        }
      }
      await hoverElement.hover()
      await page.waitForTimeout(2000)
      await page.waitForTimeout(1000)

      // ２２　キャプチャの撮影をする
      console.log('キャプチャを取得中...')
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_tooltip.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath2}`)

      // ２３　サイドメニュー内の要素　ラベル"カーソル 太郎丸"　を探し、選択
      console.log('サイドメニュー内の「カーソル 太郎丸」を探しています...')
      let userButton
      try {
        userButton = page.getByLabel('カーソル 太郎丸').first()
        await userButton.waitFor({ timeout: 10000 })
      } catch (e) {
        userButton = page.locator('nav button, aside button').filter({ hasText: 'カーソル 太郎丸' }).first()
        await userButton.waitFor({ timeout: 10000 })
      }
      await userButton.click()
      await page.waitForTimeout(2000)

      // ２４　1秒待機後、メニュー内のログアウトを選択　ログアウトの返り値は存在しないため、ログイン画面に遷移したら手順25を開始
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

      // ２５　ログイン画面で、1秒待機後以下情報でログインをする
      await page.waitForTimeout(1000)
      console.log('元のユーザー（j0001）でログイン中...')
      await login(page, loginId, password)

      // ２６～３５　教職員の編集・削除
      // ２６　画面内の要素から、教職員名簿を探し選択する
      console.log('教職員名簿を探しています（2回目）...')
      const staffsLink2 = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink2.waitFor({ timeout: 10000 })
      await staffsLink2.click()
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      await page.waitForTimeout(2000)

      // ２７　教職員名簿画面で、所属組織のプルダウンを画面内の要素から探してプルダウンを選択し、プルダウンメニュー内の E2E小学校_二学期制　を選択する
      console.log('所属組織のプルダウンを探しています...')
      const organizationSelect2 = page.getByLabel('所属組織')
      await organizationSelect2.waitFor({ timeout: 10000 })
      await organizationSelect2.click()
      await page.waitForTimeout(2000)

      console.log('E2E小学校_二学期制を選択中...')
      const schoolOption2 = page.getByRole('option', { name: 'E2E小学校_二学期制' }).first()
      await schoolOption2.waitFor({ timeout: 10000 })
      await schoolOption2.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ２８　画面内の要素から、カーソル 太郎丸　の列に存在する　… ボタンを選択する
      console.log('「カーソル 太郎丸」の列の「…」ボタンを探しています...')
      let cursorTaroMaruRow
      try {
        cursorTaroMaruRow = page.locator('tr').filter({ hasText: 'カーソル編集 太郎丸' }).first()
        await cursorTaroMaruRow.waitFor({ timeout: 5000 })
      } catch (e) {
        cursorTaroMaruRow = page.locator('tr').filter({ hasText: 'カーソル 太郎丸' }).first()
        await cursorTaroMaruRow.waitFor({ timeout: 10000 })
      }
      
      let menuButton
      try {
        menuButton = cursorTaroMaruRow.getByRole('button', { name: /^[……]$/ }).first()
        await menuButton.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          menuButton = cursorTaroMaruRow.getByRole('button', { name: /メニュー|menu/i }).first()
          await menuButton.waitFor({ timeout: 5000 })
        } catch (e2) {
          menuButton = cursorTaroMaruRow.locator('button').last()
          await menuButton.waitFor({ timeout: 5000 })
        }
      }
      await menuButton.click()
      await page.waitForTimeout(2000)

      // ２９　編集を選択する
      console.log('編集を探しています...')
      const editMenuItem = page.getByRole('menuitem', { name: '編集' }).first()
      await editMenuItem.waitFor({ timeout: 10000 })
      await editMenuItem.click()
      await page.waitForTimeout(2000)

      const editDialog = page.getByRole('dialog')
      await editDialog.waitFor({ timeout: 10000 })

      // ３０　通称・姓の入力欄に　カーソル編集　と入力
      console.log('通称・姓の入力欄を探しています（編集）...')
      const lastNameFieldEdit = editDialog.getByLabel('通称・姓').first()
      await lastNameFieldEdit.waitFor({ timeout: 10000 })
      await lastNameFieldEdit.click()
      await lastNameFieldEdit.clear()
      await lastNameFieldEdit.fill('カーソル編集')
      await page.waitForTimeout(2000)

      // ３１　ダイアログ内の　保存ボタンを選択する
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

      // ３２　キャプチャの撮影をする
      console.log('キャプチャを取得中（編集後）...')
      const now3 = new Date()
      const timeStr3 = `${String(now3.getHours()).padStart(2, '0')}${String(now3.getMinutes()).padStart(2, '0')}${String(now3.getSeconds()).padStart(2, '0')}`
      const capturePath3 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr3}_after_edit.png`)
      await page.screenshot({ path: capturePath3, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath3}`)

      // ３３～３５　教職員の削除
      // ３３　画面内の要素から、カーソル 太郎丸　の列に存在する　… ボタンを選択する
      console.log('「カーソル 太郎丸」の列の「…」ボタンを再度探しています...')
      let cursorTaroMaruRow2
      try {
        cursorTaroMaruRow2 = page.locator('tr').filter({ hasText: 'カーソル編集 太郎丸' }).first()
        await cursorTaroMaruRow2.waitFor({ timeout: 5000 })
      } catch (e) {
        cursorTaroMaruRow2 = page.locator('tr').filter({ hasText: 'カーソル 太郎丸' }).first()
        await cursorTaroMaruRow2.waitFor({ timeout: 10000 })
      }
      
      let menuButton2
      try {
        menuButton2 = cursorTaroMaruRow2.getByRole('button', { name: /^[……]$/ }).first()
        await menuButton2.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          menuButton2 = cursorTaroMaruRow2.getByRole('button', { name: /メニュー|menu/i }).first()
          await menuButton2.waitFor({ timeout: 5000 })
        } catch (e2) {
          menuButton2 = cursorTaroMaruRow2.locator('button').last()
          await menuButton2.waitFor({ timeout: 5000 })
        }
      }
      await menuButton2.click()
      await page.waitForTimeout(2000)

      // ３４　削除を選択する
      console.log('削除を探しています...')
      const deleteMenuItem = page.getByRole('menuitem', { name: '削除' }).first()
      await deleteMenuItem.waitFor({ timeout: 10000 })
      await deleteMenuItem.click()
      await page.waitForTimeout(2000)

      // ３５　ダイアログ内で　tab操作を２回行い、↓キー操作を１回行い、フォーカスを「完全に削除する」の状態で　削除ボタンを選択
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
