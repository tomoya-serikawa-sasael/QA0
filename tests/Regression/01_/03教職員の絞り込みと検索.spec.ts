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
  
  // ログインが成功したことを確認（ログインページに留まっていないか確認）
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    console.log('警告: ログイン後もログインページに留まっています。URLを確認します...')
    await page.waitForTimeout(2000)
    // 再度URLを確認
    const retryUrl = page.url()
    if (retryUrl.includes('/login')) {
      throw new Error('ログインに失敗しました。ログインページから遷移できませんでした。')
    }
  }
  
  console.log(`✓ ログイン成功！現在のURL: ${page.url()}`)
  
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
}

test.describe('教職員の絞り込みと検索', () => {
  test.describe.configure({ mode: 'serial' }) // 同じファイル内のテストを連続実行（ブラウザを閉じない）
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 3-1 教職員一覧の絞り込み（所属）1 =====
  test('3-1 教職員一覧の絞り込み（所属）1', async ({ page }) => {
    const testNumber = '3-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // ログインをする
      await login(page, loginId, password)

      // １　画面内の要素から、教職員名簿を探し選択する
      console.log('教職員名簿を探しています...')
      const staffsLink = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink.waitFor({ timeout: 10000 })
      await staffsLink.click()
      
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      
      await page.waitForTimeout(2000)

      // ２　教職員名簿画面で、所属組織のプルダウンを画面内の要素から探してプルダウンを選択
      console.log('所属組織のプルダウンを探しています...')
      const organizationSelect = page.getByLabel('所属組織')
      await organizationSelect.waitFor({ timeout: 10000 })
      await organizationSelect.click()
      
      await page.waitForTimeout(2000)

      // ３　プルダウンメニュー内の南北自治体を選択する
      console.log('南北自治体を選択中...')
      const nanbokuOption = page.getByRole('option', { name: '南北自治体' }).first()
      await nanbokuOption.waitFor({ timeout: 10000 })
      await nanbokuOption.click()
      
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ４　キャプチャの撮影をする
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

  // ===== 3-2 教職員一覧の絞り込み（所属）2 =====
  test('3-2 教職員一覧の絞り込み（所属）2', async ({ page }) => {
    const testNumber = '3-2'
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
      
      // １　画面内の要素から、教職員名簿を探し選択する
      console.log('教職員名簿を探しています...')
      const staffsLink = page.getByRole('link', { name: '教職員名簿' }).first()
      await staffsLink.waitFor({ timeout: 10000 })
      await staffsLink.click()
      
      await page.waitForTimeout(2000)

      await page.waitForURL(/\/municipality\/staffs/, { timeout: 30000 })
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      
      console.log(`✓ 教職員名簿画面に遷移しました: ${page.url()}`)
      
      await page.waitForTimeout(2000)

      // 3-1の状態（南北自治体が選択されている）を再現
      console.log('3-1の状態を再現中（南北自治体を選択）...')
      const organizationSelect = page.getByLabel('所属組織')
      await organizationSelect.waitFor({ timeout: 10000 })
      await organizationSelect.click()
      await page.waitForTimeout(2000)
      
      const nanbokuOption = page.getByRole('option', { name: '南北自治体' }).first()
      await nanbokuOption.waitFor({ timeout: 10000 })
      await nanbokuOption.click()
      await page.waitForTimeout(2000)
      
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ２　教職員名簿画面で、所属組織のプルダウンを画面内の要素から探してプルダウンを選択
      console.log('所属組織のプルダウンを探しています...')
      await organizationSelect.waitFor({ timeout: 10000 })
      await organizationSelect.click()
      
      await page.waitForTimeout(2000)

      // ３　プルダウンメニュー内の E2E小学校_二学期制　を選択する
      console.log('E2E小学校_二学期制を選択中...')
      const schoolOption = page.getByRole('option', { name: 'E2E小学校_二学期制' }).first()
      await schoolOption.waitFor({ timeout: 10000 })
      await schoolOption.click()
      
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ４　キャプチャの撮影をする
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

  // ===== 3-3 教職員一覧の絞り込み（役割） =====
  test('3-3 教職員一覧の絞り込み（役割）', async ({ page }) => {
    const testNumber = '3-3'
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
      
      // 3-2の状態（E2E小学校_二学期制が選択されている）を再現
      console.log('3-2の状態を再現中（E2E小学校_二学期制を選択）...')
      const organizationSelect = page.getByLabel('所属組織')
      await organizationSelect.waitFor({ timeout: 10000 })
      await organizationSelect.click()
      await page.waitForTimeout(2000)
      
      const schoolOption = page.getByRole('option', { name: 'E2E小学校_二学期制' }).first()
      await schoolOption.waitFor({ timeout: 10000 })
      await schoolOption.click()
      await page.waitForTimeout(2000)
      
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)
      
      // １　教職員名簿画面で、役割のプルダウンを画面内の要素から探してプルダウンを選択
      console.log('役割のプルダウンを探しています...')
      const roleSelect = page.getByLabel('役割')
      await roleSelect.waitFor({ timeout: 10000 })
      await roleSelect.click()
      
      await page.waitForTimeout(2000)

      // ２　プルダウンメニュー内の「校長」を選択する
      console.log('校長を選択中...')
      const roleOption = page.getByRole('option', { name: '校長' }).first()
      await roleOption.waitFor({ timeout: 10000 })
      await roleOption.click()
      
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ３　キャプチャの撮影をする
      console.log('キャプチャを取得中...')
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const capturePath = path.join(dateFolder, `${folderName}${testNumber}_${timeStr}.png`)
      await page.screenshot({ path: capturePath, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath}`)

      // ４　教職員名簿画面で、役割のプルダウンを画面内の要素から探してプルダウンを選択
      console.log('役割のプルダウンを再度探しています...')
      await roleSelect.waitFor({ timeout: 10000 })
      await roleSelect.click()
      
      await page.waitForTimeout(2000)

      // ５　プルダウンメニュー内の「すべて」を選択する
      console.log('すべてを選択中...')
      const allOption = page.getByRole('option', { name: 'すべて' }).first()
      await allOption.waitFor({ timeout: 10000 })
      await allOption.click()
      
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
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

  // ===== 3-4 教職員一覧の絞り込み（検索） =====
  test('3-4 教職員一覧の絞り込み（検索）', async ({ page }) => {
    const testNumber = '3-4'
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
      
      // 3-3の状態（役割が「すべて」に戻されている）を再現
      console.log('3-3の状態を再現中（役割を「すべて」に設定）...')
      const roleSelect = page.getByLabel('役割')
      await roleSelect.waitFor({ timeout: 10000 })
      await roleSelect.click()
      await page.waitForTimeout(2000)
      
      const allOption = page.getByRole('option', { name: 'すべて' }).first()
      await allOption.waitFor({ timeout: 10000 })
      await allOption.click()
      await page.waitForTimeout(2000)
      
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)
      
      // １　教職員名簿画面で、検索フィールドを画面内の要素から探して選択
      console.log('検索フィールドを探しています...')
      let searchField
      try {
        searchField = page.getByLabel('検索').first()
        await searchField.waitFor({ timeout: 5000 })
      } catch (e) {
        searchField = page.getByPlaceholder('氏名、アカウント情報で検索').first()
        await searchField.waitFor({ timeout: 10000 })
      }
      await searchField.click()
      
      await page.waitForTimeout(2000)

      // ２　検索フィールドに「ナシ」と入力
      console.log('「ナシ」と入力中...')
      await searchField.fill('ナシ')
      
      await page.waitForTimeout(2000)

      await page.waitForTimeout(500) // debounce待機
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ３　キャプチャの撮影をする
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
