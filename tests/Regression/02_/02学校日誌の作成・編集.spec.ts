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

test.describe('学校日誌の作成・編集', () => {
  test.setTimeout(300_000) // タイムアウトを5分に設定

  // ===== 2-1 学校日誌の作成 =====
  test('2-1 学校日誌の作成', async ({ page }) => {
    const testNumber = '2-1'
    console.log(`\n===== [${testNumber}] テスト開始 =====`)
    const dateFolder = getDateFolder()
    
    try {
      // １　ログインをする
      await login(page, loginId, password)

      // ２　ログイン後1秒ディレイする
      console.log('ログイン後1秒ディレイ中...')
      await page.waitForTimeout(1000)

      // ３　画面内の要素で学校日誌を検索し選択する
      console.log('学校日誌を検索中...')
      const schoolDiaryLink = page.getByRole('link', { name: '学校日誌' }).first()
      await schoolDiaryLink.waitFor({ timeout: 10000 })
      await schoolDiaryLink.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ４～２３　各種フィールドに入力
      // ４　画面内、行事予定　に、登録１　と入力
      console.log('行事予定に入力中...')
      const eventScheduleField = page.getByLabel('行事予定').first()
      await eventScheduleField.waitFor({ timeout: 10000 })
      await eventScheduleField.fill('登録１')
      await page.waitForTimeout(2000)

      // ５　画面内、教職員の予定　に、登録２　と入力
      console.log('教職員の予定に入力中...')
      const staffScheduleField = page.getByLabel('教職員の予定').first()
      await staffScheduleField.waitFor({ timeout: 10000 })
      await staffScheduleField.fill('登録２')
      await page.waitForTimeout(2000)

      // ６　画面内、出張・職専免等　に、登録3　と入力
      console.log('出張・職専免等に入力中...')
      const businessTripField = page.getByLabel('出張・職専免等').first()
      await businessTripField.waitFor({ timeout: 10000 })
      await businessTripField.fill('登録3')
      await page.waitForTimeout(2000)

      // ７　画面内、年次休暇　に、登録４　と入力
      console.log('年次休暇に入力中...')
      const annualLeaveField = page.getByLabel('年次休暇').first()
      await annualLeaveField.waitFor({ timeout: 10000 })
      await annualLeaveField.fill('登録４')
      await page.waitForTimeout(2000)

      // ８　画面内、病気休暇　に、登録５　と入力
      console.log('病気休暇に入力中...')
      const sickLeaveField = page.getByLabel('病気休暇').first()
      await sickLeaveField.waitFor({ timeout: 10000 })
      await sickLeaveField.fill('登録５')
      await page.waitForTimeout(2000)

      // ９　画面内、特別休暇　に、登録６　と入力
      console.log('特別休暇に入力中...')
      const specialLeaveField = page.getByLabel('特別休暇').first()
      await specialLeaveField.waitFor({ timeout: 10000 })
      await specialLeaveField.fill('登録６')
      await page.waitForTimeout(2000)

      // １０　画面内、その他　に、登録７　と入力
      console.log('その他に入力中...')
      const otherField = page.getByLabel('その他').first()
      await otherField.waitFor({ timeout: 10000 })
      await otherField.fill('登録７')
      await page.waitForTimeout(2000)

      // １１　画面内、担当教職員1　に、登録８　と入力
      console.log('担当教職員1に入力中...')
      const staff1Field = page.getByLabel('担当教職員1').first()
      await staff1Field.waitFor({ timeout: 10000 })
      await staff1Field.fill('登録８')
      await page.waitForTimeout(2000)

      // １２　画面内、担当教職員2　に、登録９　と入力
      console.log('担当教職員2に入力中...')
      const staff2Field = page.getByLabel('担当教職員2').first()
      await staff2Field.waitFor({ timeout: 10000 })
      await staff2Field.fill('登録９')
      await page.waitForTimeout(2000)

      // １３　画面内、開始時刻　に、半角　09　31　と入力
      console.log('開始時刻に入力中（半角09 31）...')
      const startTimeField = page.getByLabel('開始時刻').first()
      await startTimeField.waitFor({ timeout: 10000 })
      await startTimeField.click()
      await page.waitForTimeout(500)
      await page.keyboard.type('09 31')
      await page.waitForTimeout(2000)

      // １４　画面内、終了時刻　に、半角　23　31　と入力
      console.log('終了時刻に入力中（半角23 31）...')
      const endTimeField = page.getByLabel('終了時刻').first()
      await endTimeField.waitFor({ timeout: 10000 })
      await endTimeField.click()
      await page.waitForTimeout(500)
      await page.keyboard.type('23 31')
      await page.waitForTimeout(2000)

      // １５　画面内、巡視時刻（1回目）　に、10 01　と入力
      console.log('巡視時刻（1回目）に入力中（10 01）...')
      const patrolTime1Field = page.getByLabel('巡視時刻（1回目）').first()
      await patrolTime1Field.waitFor({ timeout: 10000 })
      await patrolTime1Field.click()
      await page.waitForTimeout(500)
      await page.keyboard.type('10 01')
      await page.waitForTimeout(2000)

      // １６　画面内、巡視時刻（2回目）　に、23 01　と入力
      console.log('巡視時刻（2回目）に入力中（23 01）...')
      const patrolTime2Field = page.getByLabel('巡視時刻（2回目）').first()
      await patrolTime2Field.waitFor({ timeout: 10000 })
      await patrolTime2Field.click()
      await page.waitForTimeout(500)
      await page.keyboard.type('23 01')
      await page.waitForTimeout(2000)

      // １７　画面内、巡視状況プルダウンを選択し、↓キーを選択　しEnterを実行（異常あり）　を選択
      console.log('巡視状況プルダウンを探しています...')
      const patrolStatusSelect = page.getByLabel('巡視状況').first()
      await patrolStatusSelect.waitFor({ timeout: 10000 })
      await patrolStatusSelect.click()
      await page.waitForTimeout(2000)

      // プルダウンメニューが表示されるまで待機
      await page.waitForTimeout(1000)

      console.log('↓キーで異常ありを選択中...')
      // ↓キーで「異常あり」まで移動
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(300)
        
        // 現在選択されているオプションを確認
        const selectedText = await page.evaluate(() => {
          const activeElement = document.activeElement as HTMLElement
          return activeElement?.textContent || activeElement?.getAttribute('aria-label') || ''
        }).catch(() => '')
        
        if (selectedText.includes('異常')) {
          console.log('異常ありが見つかりました')
          break
        }
      }
      
      // Enterキーで確定
      await page.keyboard.press('Enter')
      await page.waitForTimeout(2000)

      // １８　画面内、詳しい状況に　に、登録10　と入力
      console.log('詳しい状況に入力中...')
      const detailField = page.getByLabel('詳しい状況').first()
      await detailField.waitFor({ timeout: 10000 })
      await detailField.fill('登録10')
      await page.waitForTimeout(2000)

      // １９　画面内、最終施錠者　に、登録11　と入力
      console.log('最終施錠者に入力中...')
      const finalLockerField = page.getByLabel('最終施錠者').first()
      await finalLockerField.waitFor({ timeout: 10000 })
      await finalLockerField.fill('登録11')
      await page.waitForTimeout(2000)

      // ２０　画面内、退庁時刻　に、2355　と入力
      console.log('退庁時刻に入力中...')
      const leaveTimeField = page.getByLabel('退庁時刻').first()
      await leaveTimeField.waitFor({ timeout: 10000 })
      await leaveTimeField.click()
      await page.waitForTimeout(500)
      await page.keyboard.type('2355')
      await page.waitForTimeout(2000)

      // ２１　画面内、来校者　に、登録12　と入力しtabキーを実行
      console.log('来校者に入力中...')
      const visitorField = page.getByLabel('来校者').first()
      await visitorField.waitFor({ timeout: 10000 })
      await visitorField.fill('登録12')
      await page.waitForTimeout(2000)

      console.log('Tabキーを実行中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(2000)

      // ２２　画面内、入力欄（その他）に、登録13　と入力
      console.log('入力欄（その他）に入力中...')
      // Tabキーで移動した後のフォーカスされた要素に入力
      await page.keyboard.type('登録13')
      await page.waitForTimeout(2000)

      // ２３　画面内、tabキー２回実行で在籍移動　に、登録14　と入力
      console.log('Tabキーを2回実行中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      
      console.log('在籍移動に入力中...')
      await page.keyboard.type('登録14')
      await page.waitForTimeout(2000)

      // ２４　画面内の要素でクラスを検索し選択する
      console.log('クラスを検索中...')
      const classLink = page.getByRole('link', { name: 'クラス' }).first()
      await classLink.waitFor({ timeout: 10000 })
      await classLink.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ２５　画面内の要素で学校日誌を検索し選択する
      console.log('学校日誌を検索中（2回目）...')
      const schoolDiaryLink2 = page.getByRole('link', { name: '学校日誌' }).first()
      await schoolDiaryLink2.waitFor({ timeout: 10000 })
      await schoolDiaryLink2.click()
      await page.waitForTimeout(2000)

      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      await page.waitForTimeout(2000)

      // ２６　キャプチャを撮影する
      console.log('キャプチャを取得中...')
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
      const capturePath = path.join(dateFolder, `${folderName}${testNumber}_${timeStr}_after_input.png`)
      await page.screenshot({ path: capturePath, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath}`)

      // ２７　行事予定　のテキストエリアを選択する
      console.log('行事予定のテキストエリアを選択中...')
      await eventScheduleField.waitFor({ timeout: 10000 })
      await eventScheduleField.click()
      await page.waitForTimeout(2000)

      // ２８　tabキーを９回実行する
      console.log('Tabキーを9回押中...')
      for (let i = 0; i < 9; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(500)
      }

      // ２９　キャプチャを撮影する
      console.log('キャプチャを取得中（Tab9回後）...')
      const now2 = new Date()
      const timeStr2 = `${String(now2.getHours()).padStart(2, '0')}${String(now2.getMinutes()).padStart(2, '0')}${String(now2.getSeconds()).padStart(2, '0')}`
      const capturePath2 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr2}_tab9.png`)
      await page.screenshot({ path: capturePath2, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath2}`)

      // ３０　tabキーを13回実行する
      console.log('Tabキーを13回押中...')
      for (let i = 0; i < 13; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(500)
      }

      // ３１　キャプチャを撮影する
      console.log('キャプチャを取得中（Tab13回後）...')
      const now3 = new Date()
      const timeStr3 = `${String(now3.getHours()).padStart(2, '0')}${String(now3.getMinutes()).padStart(2, '0')}${String(now3.getSeconds()).padStart(2, '0')}`
      const capturePath3 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr3}_tab13.png`)
      await page.screenshot({ path: capturePath3, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath3}`)

      // ３２　tabキーを7回実行する
      console.log('Tabキーを7回押中...')
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(500)
      }

      // ３３　キャプチャを撮影する
      console.log('キャプチャを取得中（Tab7回後）...')
      const now4 = new Date()
      const timeStr4 = `${String(now4.getHours()).padStart(2, '0')}${String(now4.getMinutes()).padStart(2, '0')}${String(now4.getSeconds()).padStart(2, '0')}`
      const capturePath4 = path.join(dateFolder, `${folderName}${testNumber}_${timeStr4}_tab7.png`)
      await page.screenshot({ path: capturePath4, fullPage: true })
      console.log(`✓ キャプチャを保存しました: ${capturePath4}`)

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
