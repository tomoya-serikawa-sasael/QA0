import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const baseUrl = 'https://nanboku.stage.sasael.dev'
const loginId = 'e2eck'
const password = 'e2ecke2ecke2eck'
const schoolName = 'E2E中学校_二学期制'
const className = '3年リグレ組'
const folderName = '03B_'

// ログイン関数
async function login(page: any, userId: string, userPassword: string) {
  console.log(`ログインページにアクセス中: ${baseUrl}/login`)
  await page.goto(`${baseUrl}/login`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })

  // ルール: テスト開始画面で1秒のディレイタイムを設定する
  await page.waitForTimeout(1000)

  console.log('ログインIDを入力中...')
  await page.getByLabel('ログインID').fill(userId)
  await page.waitForTimeout(500)

  console.log('パスワードを入力中...')
  await page.getByLabel('パスワード').fill(userPassword)
  await page.waitForTimeout(500)

  console.log('ログインボタンをクリック中...')
  // type="submit"のログインボタンを選択
  const loginButton = page.locator('button[type="submit"]').filter({ hasText: 'ログイン' }).first()
  await loginButton.waitFor({ timeout: 10000 })
  await Promise.all([
    page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 30000 }),
    loginButton.click(),
  ])

  const currentUrl = page.url()
  console.log(`✓ ログイン成功！現在のURL: ${currentUrl}`)
  await page.waitForTimeout(2000)
}

// キャプチャ取得関数
async function captureTestResult(page: any, testNumber: string, testName: string) {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '')
  
  const resultsDir = path.join(process.cwd(), 'test-results', dateStr)
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }
  
  const fileName = `${dateStr}_${folderName}${testNumber}_${testName}_${timeStr}.png`
  const filePath = path.join(resultsDir, fileName)
  
  await page.waitForTimeout(2000)
  await page.screenshot({ path: filePath, fullPage: true })
  console.log(`✓ キャプチャを保存: ${filePath}`)
}

// 中学3年生の生年月日を生成（2010/04/02 ～ 2011/04/01の範囲）
function generateBirthDate(): string {
  const startDate = new Date('2010-04-02')
  const endDate = new Date('2011-04-01')
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const randomDays = Math.floor(Math.random() * (daysDiff + 1))
  const birthDate = new Date(startDate.getTime() + randomDays * 24 * 60 * 60 * 1000)
  
  const year = birthDate.getFullYear()
  const month = String(birthDate.getMonth() + 1).padStart(2, '0')
  const day = String(birthDate.getDate()).padStart(2, '0')
  
  return `${year}/${month}/${day}`
}

// 整合した姓名を生成
function generateStudentName(): { lastName: string, firstName: string, lastNameKana: string, firstNameKana: string } {
  const lastNames = ['山田', '佐藤', '鈴木', '高橋', '田中']
  const firstNames = ['太郎', '花子', '次郎', '美咲', '三郎']
  const lastNameKanas = ['ヤマダ', 'サトウ', 'スズキ', 'タカハシ', 'タナカ']
  const firstNamesKanas = ['タロウ', 'ハナコ', 'ジロウ', 'ミサキ', 'サブロウ']
  
  const index = Math.floor(Math.random() * lastNames.length)
  
  return {
    lastName: lastNames[index],
    firstName: firstNames[index],
    lastNameKana: lastNameKanas[index],
    firstNameKana: firstNamesKanas[index]
  }
}

// 年月日の入力関数（共通）
// ・西暦の年が表示されている箇所をクリックして、半角数字で指定の数字を入力
// ・西暦の右隣の、月が表示されている箇所をクリックして、半角数字で指定の数字を入力
// ・月の右隣の、日が表示されている箇所をクリックして、半角数字で指定の数字を入力
async function inputDate(page: any, year: string, month: string, day: string) {
  console.log(`日付を入力中（${year}年${month}月${day}日）...`)
  
  // 年のフィールドを探してクリック
  console.log('年のフィールドを入力中...')
  const yearPatterns = [
    /年.*日付/i,
    /日付.*年/i,
    /^年$/,
    /年,日付/i,
  ]
  
  let yearField = null
  for (const pattern of yearPatterns) {
    try {
      yearField = page.getByLabel(pattern).first()
      await yearField.waitFor({ timeout: 2000, state: 'visible' })
      break
    } catch (e) {
      continue
    }
  }
  
  // ラベルで見つからない場合は、テキストで「年」を含む要素を探す
  if (!yearField) {
    try {
      const allInputs = page.locator('input[type="text"], input[type="number"]')
      const inputCount = await allInputs.count()
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i)
        const ariaLabel = await input.getAttribute('aria-label').catch(() => '')
        const placeholder = await input.getAttribute('placeholder').catch(() => '')
        if (ariaLabel && /年/i.test(ariaLabel) || placeholder && /年/i.test(placeholder)) {
          yearField = input
          await yearField.waitFor({ timeout: 2000, state: 'visible' })
          break
        }
      }
    } catch (e) {
      // 見つからない場合は続行
    }
  }
  
  if (yearField) {
    await yearField.click()
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.type(year)
    await page.waitForTimeout(500)
    console.log(`✓ 年を入力: ${year}`)
  } else {
    throw new Error('年のフィールドが見つかりませんでした')
  }
  
  // 月のフィールドを探してクリック
  console.log('月のフィールドを入力中...')
  const monthPatterns = [
    /月.*日付/i,
    /日付.*月/i,
    /^月$/,
    /月,日付/i,
  ]
  
  let monthField = null
  for (const pattern of monthPatterns) {
    try {
      monthField = page.getByLabel(pattern).first()
      await monthField.waitFor({ timeout: 2000, state: 'visible' })
      break
    } catch (e) {
      continue
    }
  }
  
  // ラベルで見つからない場合は、テキストで「月」を含む要素を探す
  if (!monthField) {
    try {
      const allInputs = page.locator('input[type="text"], input[type="number"]')
      const inputCount = await allInputs.count()
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i)
        const ariaLabel = await input.getAttribute('aria-label').catch(() => '')
        const placeholder = await input.getAttribute('placeholder').catch(() => '')
        if (ariaLabel && /月/i.test(ariaLabel) || placeholder && /月/i.test(placeholder)) {
          monthField = input
          await monthField.waitFor({ timeout: 2000, state: 'visible' })
          break
        }
      }
    } catch (e) {
      // 見つからない場合は続行
    }
  }
  
  if (monthField) {
    await monthField.click()
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.type(month)
    await page.waitForTimeout(500)
    console.log(`✓ 月を入力: ${month}`)
  } else {
    throw new Error('月のフィールドが見つかりませんでした')
  }
  
  // 日のフィールドを探してクリック
  console.log('日のフィールドを入力中...')
  const dayPatterns = [
    /日.*日付/i,
    /日付.*日/i,
    /^日$/,
    /日,日付/i,
  ]
  
  let dayField = null
  for (const pattern of dayPatterns) {
    try {
      dayField = page.getByLabel(pattern).first()
      await dayField.waitFor({ timeout: 2000, state: 'visible' })
      break
    } catch (e) {
      continue
    }
  }
  
  // ラベルで見つからない場合は、テキストで「日」を含む要素を探す
  if (!dayField) {
    try {
      const allInputs = page.locator('input[type="text"], input[type="number"]')
      const inputCount = await allInputs.count()
      for (let i = 0; i < inputCount; i++) {
        const input = allInputs.nth(i)
        const ariaLabel = await input.getAttribute('aria-label').catch(() => '')
        const placeholder = await input.getAttribute('placeholder').catch(() => '')
        if (ariaLabel && /日/i.test(ariaLabel) || placeholder && /日/i.test(placeholder)) {
          dayField = input
          await dayField.waitFor({ timeout: 2000, state: 'visible' })
          break
        }
      }
    } catch (e) {
      // 見つからない場合は続行
    }
  }
  
  if (dayField) {
    await dayField.click()
    await page.waitForTimeout(200)
    await page.keyboard.press('Control+a')
    await page.waitForTimeout(100)
    await page.keyboard.type(day)
    await page.waitForTimeout(500)
    console.log(`✓ 日を入力: ${day}`)
  } else {
    throw new Error('日のフィールドが見つかりませんでした')
  }
  
  console.log(`✓ 日付を入力完了: ${year}/${month}/${day}`)
  await page.waitForTimeout(1000)
}

test.describe('成績入力　2学期制ABCパターン', () => {
  test.setTimeout(600000) // 10分に設定（全組み合わせ処理のため）
  test('1-1', async ({ page }) => {
    const testNumber = '1-1'
    console.log(`===== [${testNumber}] テスト開始 =====`)
    
    try {
      // １　共通設定を参照しログインする
      console.log('共通設定を参照しログイン中...')
      await login(page, loginId, password)
      
      // 今回はログイン後手順１４から開始する
      // 手順1-13はスキップ
      await page.waitForTimeout(1000)
      
      /* 手順1-13はスキップ（今回はコメントアウト）
      // ２　画面内から、児童生徒名簿を検索し選択する
      console.log('児童生徒名簿を検索中...')
      let studentListButton
      try {
        studentListButton = page.getByRole('link', { name: /児童生徒名簿/i }).first()
        await studentListButton.waitFor({ timeout: 5000 })
      } catch (e) {
        try {
          studentListButton = page.getByRole('button', { name: /児童生徒名簿/i }).first()
          await studentListButton.waitFor({ timeout: 5000 })
        } catch (e2) {
          studentListButton = page.getByText(/児童生徒名簿/i).first()
          await studentListButton.waitFor({ timeout: 10000 })
        }
      }
      await studentListButton.click()
      await page.waitForTimeout(2000)
      
      // ３　画面内から、右記 IDを検索し、該当するボタンを選択する※"react-aria3916239156-_r_19p_"
      // 絶対にサイドメニューの「サイドメニューを閉じる」ボタンではない
      console.log('メニューボタン（…）を検索中（サイドメニューを除外）...')
      await page.waitForTimeout(2000)
      
      const mainContent = page.locator('main').or(page.locator('[role="main"]')).or(page.locator('section')).first()
      
      let moreButton
      try {
        moreButton = mainContent.getByRole('button', { name: 'メニュー' }).first()
        await moreButton.waitFor({ timeout: 5000, state: 'visible' })
        const buttonText = await moreButton.textContent({ timeout: 1000 }).catch(() => '')
        if (buttonText && buttonText.includes('サイドメニューを閉じる')) {
          throw new Error('サイドメニューのボタンを検出しました')
        }
        console.log('メインコンテンツエリア内のaria-label="メニュー"のボタンを発見')
      } catch (e) {
        try {
          moreButton = mainContent.locator('button[id*="react-aria"][id*="_r_19p_"]').first()
          await moreButton.waitFor({ timeout: 5000, state: 'visible' })
          console.log('メインコンテンツエリア内のreact-aria _r_19p_ IDパターンのボタンを発見')
        } catch (e2) {
          try {
            moreButton = mainContent.locator('button[id*="react-aria"]').first()
            await moreButton.waitFor({ timeout: 5000, state: 'visible' })
            const buttonText = await moreButton.textContent({ timeout: 1000 }).catch(() => '')
            const ariaLabel = await moreButton.getAttribute('aria-label').catch(() => '')
            if ((buttonText && buttonText.includes('サイドメニューを閉じる')) || 
                (ariaLabel && ariaLabel.includes('サイドメニューを閉じる'))) {
              throw new Error('サイドメニューのボタンを検出しました')
            }
            console.log('メインコンテンツエリア内のreact-aria IDパターンのボタンを発見')
          } catch (e3) {
            throw new Error('メニューボタン（…）が見つかりません')
          }
        }
      }
      
      try {
        await moreButton.click({ timeout: 5000 })
      } catch (e) {
        await moreButton.click({ force: true })
      }
      await page.waitForTimeout(2000)
      
      // ４　メニュー内から児童生徒を登録　を選択
      console.log('児童生徒を登録を選択中...')
      let registerMenuItem
      try {
        registerMenuItem = page.getByRole('menuitem', { name: /児童生徒を登録/i }).first()
        await registerMenuItem.waitFor({ timeout: 5000, state: 'visible' })
        console.log('menuitemロールで発見')
      } catch (e) {
        try {
          registerMenuItem = page.getByText(/児童生徒を登録/i).first()
          await registerMenuItem.waitFor({ timeout: 5000, state: 'visible' })
          console.log('テキストで発見')
        } catch (e2) {
          throw new Error('児童生徒を登録のメニュー項目が見つかりません')
        }
      }
      await registerMenuItem.click()
      await page.waitForTimeout(2000)
      
      // ダイアログが表示されるのを待つ
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ timeout: 10000, state: 'visible' })
      console.log('✓ 児童生徒登録ダイアログが表示されました')
      
      // ５　通称姓　通称名　通称姓（カナ）　通称名（カナ）　に整合した名前を入力する
      console.log('通称姓・通称名・通称姓（カナ）・通称名（カナ）を入力中...')
      const studentName = generateStudentName()
      
      // 通称姓
      const lastNameField = dialog.getByLabel(/通称.*姓/i).first()
      await lastNameField.waitFor({ timeout: 5000, state: 'visible' })
      await lastNameField.fill(studentName.lastName)
      
      // 通称名
      const firstNameField = dialog.getByLabel(/通称.*名/i).first()
      await firstNameField.waitFor({ timeout: 5000, state: 'visible' })
      await firstNameField.fill(studentName.firstName)
      
      // 通称姓（カナ）
      const lastNameKanaField = dialog.getByLabel(/通称.*姓.*カナ/i).first()
      await lastNameKanaField.waitFor({ timeout: 5000, state: 'visible' })
      await lastNameKanaField.fill(studentName.lastNameKana)
      
      // 通称名（カナ）
      const firstNameKanaField = dialog.getByLabel(/通称.*名.*カナ/i).first()
      await firstNameKanaField.waitFor({ timeout: 5000, state: 'visible' })
      await firstNameKanaField.fill(studentName.firstNameKana)
      
      console.log(`✓ 姓名を入力: ${studentName.lastName} ${studentName.firstName} (${studentName.lastNameKana} ${studentName.firstNameKana})`)
      await page.waitForTimeout(2000)
      
      // ６　生年月日に中学3年として適切な年月日を入力する
      // 年 → 年,生年月日　月 → 月,生年月日　日 → 日,生年月日　にそれぞれ入力する
      console.log('生年月日を入力中（中学3年）...')
      const birthDate = generateBirthDate()
      const [year, month, day] = birthDate.split('/')
      
      // 生年月日フィールドを探してクリック
      const birthDateField = dialog.getByLabel(/生年月日/i).first()
      await birthDateField.waitFor({ timeout: 5000, state: 'visible' })
      await birthDateField.click()
      await page.waitForTimeout(500)
      
      // 年のフィールドを探して入力（複数のパターンで試す）
      console.log('年のフィールドを入力中...')
      let yearField = null
      const yearPatterns = [
        /年.*生年月日/i,
        /生年月日.*年/i,
        /^年$/,
        /年,生年月日/i,
      ]
      
      for (const pattern of yearPatterns) {
        try {
          yearField = dialog.getByLabel(pattern).first()
          await yearField.waitFor({ timeout: 2000, state: 'visible' })
          break
        } catch (e) {
          continue
        }
      }
      
      // ラベルで見つからない場合は、生年月日フィールド内の最初の入力フィールドを探す
      if (!yearField) {
        // 生年月日フィールドの親要素内でinput要素を探す
        const birthDateContainer = birthDateField.locator('..')
        const inputs = birthDateContainer.locator('input[type="text"], input[type="number"]')
        const count = await inputs.count()
        if (count > 0) {
          yearField = inputs.first()
        }
      }
      
      if (yearField) {
        await yearField.click()
        await page.waitForTimeout(200)
        await page.keyboard.press('Control+a')
        await page.waitForTimeout(100)
        await page.keyboard.type(year)
        await page.waitForTimeout(500)
        
        // 月のフィールドを探して入力
        console.log('月のフィールドを入力中...')
        let monthField = null
        const monthPatterns = [
          /月.*生年月日/i,
          /生年月日.*月/i,
          /^月$/,
          /月,生年月日/i,
        ]
        
        for (const pattern of monthPatterns) {
          try {
            monthField = dialog.getByLabel(pattern).first()
            await monthField.waitFor({ timeout: 2000, state: 'visible' })
            break
          } catch (e) {
            continue
          }
        }
        
        // ラベルで見つからない場合は、Tabキーで次のフィールドに移動
        if (!monthField) {
          await page.keyboard.press('Tab')
          await page.waitForTimeout(200)
          monthField = page.locator('input:focus, [contenteditable="true"]:focus').first()
        }
        
        if (monthField) {
          await monthField.click()
          await page.waitForTimeout(200)
          await page.keyboard.press('Control+a')
          await page.waitForTimeout(100)
          await page.keyboard.type(month)
          await page.waitForTimeout(500)
        }
        
        // 日のフィールドを探して入力
        console.log('日のフィールドを入力中...')
        let dayField = null
        const dayPatterns = [
          /日.*生年月日/i,
          /生年月日.*日/i,
          /^日$/,
          /日,生年月日/i,
        ]
        
        for (const pattern of dayPatterns) {
          try {
            dayField = dialog.getByLabel(pattern).first()
            await dayField.waitFor({ timeout: 2000, state: 'visible' })
            break
          } catch (e) {
            continue
          }
        }
        
        // ラベルで見つからない場合は、Tabキーで次のフィールドに移動
        if (!dayField) {
          await page.keyboard.press('Tab')
          await page.waitForTimeout(200)
          dayField = page.locator('input:focus, [contenteditable="true"]:focus').first()
        }
        
        if (dayField) {
          await dayField.click()
          await page.waitForTimeout(200)
          await page.keyboard.press('Control+a')
          await page.waitForTimeout(100)
          await page.keyboard.type(day)
          await page.waitForTimeout(500)
        }
        
        console.log(`✓ 生年月日を入力: ${birthDate} (年: ${year}, 月: ${month}, 日: ${day})`)
        await page.waitForTimeout(2000)
      } else {
        // フィールドが見つからない場合は、生年月日フィールドに直接入力
        console.log('個別フィールドが見つからないため、生年月日フィールドに直接入力します...')
        await birthDateField.click()
        await page.waitForTimeout(200)
        await page.keyboard.press('Control+a')
        await page.waitForTimeout(200)
        await page.keyboard.type(birthDate)
        await page.waitForTimeout(500)
        await page.keyboard.press('Enter')
        console.log(`✓ 生年月日を入力: ${birthDate}`)
        await page.waitForTimeout(2000)
      }
      
      // 性別は、入力した生徒の姓名と整合のある種別を選択する
      console.log('性別を選択中...')
      let genderField = null
      const genderPatterns = [
        /性別/i,
        /性/i,
      ]
      
      for (const pattern of genderPatterns) {
        try {
          genderField = dialog.getByLabel(pattern).first()
          await genderField.waitFor({ timeout: 2000, state: 'visible' })
          break
        } catch (e) {
          continue
        }
      }
      
      if (genderField) {
        await genderField.click()
        await page.waitForTimeout(500)
        
        // 生徒の姓名から性別を推測（名前に「子」「美」「花」などが含まれる場合は「女」、それ以外はランダム）
        const firstName = studentName.firstName
        let selectedGender = '男'
        if (firstName.includes('子') || firstName.includes('美') || firstName.includes('花') || firstName.includes('香') || firstName.includes('菜')) {
          selectedGender = '女'
        } else {
          // ランダムに選択
          selectedGender = Math.random() < 0.5 ? '男' : '女'
        }
        
        // 性別オプションを選択
        try {
          const genderOption = page.getByRole('option', { name: selectedGender }).first()
          await genderOption.waitFor({ timeout: 3000, state: 'visible' })
          await genderOption.click()
          console.log(`✓ 性別を選択: ${selectedGender}`)
        } catch (e) {
          // オプションが見つからない場合は、キーボードで選択
          if (selectedGender === '女') {
            await page.keyboard.press('ArrowDown')
            await page.waitForTimeout(200)
          }
          await page.keyboard.press('Enter')
          console.log(`✓ 性別を選択（キーボード操作）: ${selectedGender}`)
        }
        await page.waitForTimeout(1000)
      } else {
        console.log('⚠ 性別フィールドが見つかりませんでした')
      }
      
      // ７　郵便番号を 001-0001　で入力する
      console.log('郵便番号を入力中...')
      const postalCodeField = dialog.getByLabel(/郵便番号/i).first()
      await postalCodeField.waitFor({ timeout: 5000, state: 'visible' })
      await postalCodeField.fill('001-0001')
      console.log('✓ 郵便番号を入力: 001-0001')
      await page.waitForTimeout(2000)
      
      // ８　住所を　東京都港区女子１番　で入力する
      console.log('住所を入力中...')
      const addressField = dialog.getByLabel(/住所/i).first()
      await addressField.waitFor({ timeout: 5000, state: 'visible' })
      await addressField.fill('東京都港区女子１番')
      console.log('✓ 住所を入力: 東京都港区女子１番')
      await page.waitForTimeout(2000)
      
      // ９　ホームルームクラスのプルダウンで、共通設定のクラスを選択
      console.log('ホームルームクラスを選択中...')
      const homeroomClassField = dialog.getByLabel(/ホームルームクラス/i).first()
      await homeroomClassField.waitFor({ timeout: 5000, state: 'visible' })
      await homeroomClassField.click()
      await page.waitForTimeout(1000)
      
      const classOption = page.getByRole('option', { name: className }).first()
      await classOption.waitFor({ timeout: 5000, state: 'visible' })
      await classOption.click()
      console.log(`✓ ホームルームクラスを選択: ${className}`)
      await page.waitForTimeout(2000)
      
      // １０　tabキー１回実行し、↓キー１回後Enter（特別支援級の処理）
      console.log('特別支援級の処理中...')
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      await page.keyboard.press('ArrowDown')
      await page.waitForTimeout(500)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
      console.log('✓ 特別支援級の処理完了')
      
      // １１　Tabキーを５回実行し、保護者１（button id="react-aria6867307217-_r_1h7_"）の　続柄プルダウンで任意の選択
      console.log('Tabキーを５回実行して保護者１の続柄を選択中...')
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(300)
      }
      await page.waitForTimeout(500)
      
      // 保護者１の続柄ボタンを探す（現在フォーカスされている要素を確認）
      let guardianRelationshipButton = null
      
      // 方法1: 完全一致のIDで探す
      try {
        guardianRelationshipButton = page.locator('button[id="react-aria6867307217-_r_1h7_"]').first()
        await guardianRelationshipButton.waitFor({ timeout: 2000, state: 'visible' })
        console.log('✓ ID完全一致で保護者１の続柄ボタンを発見')
      } catch (e) {
        // 方法2: IDの一部（_r_1h7_）で探す
        try {
          guardianRelationshipButton = page.locator('button[id*="_r_1h7_"]').first()
          await guardianRelationshipButton.waitFor({ timeout: 2000, state: 'visible' })
          console.log('✓ ID部分一致（_r_1h7_）で保護者１の続柄ボタンを発見')
        } catch (e2) {
          // 方法3: 現在フォーカスされている要素を確認
          try {
            const focusedElement = page.locator(':focus')
            const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase())
            const id = await focusedElement.getAttribute('id')
            console.log(`現在フォーカスされている要素: ${tagName}, id="${id}"`)
            
            if (tagName === 'button' || tagName === 'div' || tagName === 'input') {
              guardianRelationshipButton = focusedElement
              console.log('✓ フォーカスされている要素を続柄ボタンとして使用')
            } else {
              // 方法4: react-ariaで始まるIDで、続柄に関連するボタンを探す
              const allButtons = dialog.locator('button[id*="react-aria"]')
              const buttonCount = await allButtons.count()
              console.log(`ダイアログ内のreact-ariaボタン数: ${buttonCount}`)
              
              for (let i = 0; i < buttonCount; i++) {
                const button = allButtons.nth(i)
                const ariaLabel = await button.getAttribute('aria-label')
                const text = await button.textContent()
                console.log(`ボタン${i}: aria-label="${ariaLabel}", text="${text}"`)
                
                if (ariaLabel && /続柄/i.test(ariaLabel)) {
                  guardianRelationshipButton = button
                  await guardianRelationshipButton.waitFor({ timeout: 2000, state: 'visible' })
                  console.log(`✓ 続柄ボタンを発見（インデックス${i}）`)
                  break
                }
              }
            }
          } catch (e3) {
            console.log('⚠ 保護者１の続柄ボタンが見つかりませんでした')
            throw new Error('保護者１の続柄ボタンが見つかりませんでした')
          }
        }
      }
      
      if (guardianRelationshipButton) {
        await guardianRelationshipButton.click()
        await page.waitForTimeout(1000)
      } else {
        // フォーカスされている要素をクリック
        await page.keyboard.press('Space')
        await page.waitForTimeout(1000)
        console.log('✓ フォーカスされている要素をSpaceキーで選択')
      }
      
      const relationships = ['父', '母', '祖父', '祖母', 'その他']
      const selectedRelationship = relationships[Math.floor(Math.random() * relationships.length)]
      
      // オプションを探す（複数の方法で試す）
      let relationshipOption = null
      try {
        relationshipOption = page.getByRole('option', { name: selectedRelationship }).first()
        await relationshipOption.waitFor({ timeout: 3000, state: 'visible' })
      } catch (e) {
        try {
          relationshipOption = page.getByText(selectedRelationship).first()
          await relationshipOption.waitFor({ timeout: 3000, state: 'visible' })
        } catch (e2) {
          // キーボードで選択
          await page.keyboard.press('ArrowDown')
          await page.waitForTimeout(500)
          await page.keyboard.press('Enter')
          console.log(`✓ 保護者１の続柄を選択（キーボード操作）`)
          await page.waitForTimeout(2000)
          // 早期リターンではなく、次のステップに進む
        }
      }
      
      if (relationshipOption) {
        await relationshipOption.click()
        console.log(`✓ 保護者１の続柄を選択: ${selectedRelationship}`)
        await page.waitForTimeout(2000)
      }
      
      // １２　tabキー１回実行し　姓（必須）　に入力
      // 　　　tabキー１回実行し　名（必須）　に入力
      // 　　　tabキー１回実行し　姓（カナ）　に入力
      // 　　　tabキー１回実行し　名（カナ）　に入力
      // 　　　いずれの入力も、生徒の姓名と整合のある姓名を入力する
      console.log('保護者情報欄の姓名・姓名カナを入力中（Tabキーで移動）...')
      
      // Tabキー１回実行して姓（必須）に入力
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      const guardianLastNameField = page.locator('input:focus').first()
      await guardianLastNameField.fill(studentName.lastName)
      await page.waitForTimeout(500)
      console.log(`✓ 保護者姓（必須）を入力: ${studentName.lastName}`)
      
      // Tabキー１回実行して名（必須）に入力
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      const guardianFirstNameField = page.locator('input:focus').first()
      const guardianFirstName = selectedRelationship === '父' ? '一郎' : selectedRelationship === '母' ? '花子' : '次郎'
      await guardianFirstNameField.fill(guardianFirstName)
      await page.waitForTimeout(500)
      console.log(`✓ 保護者名（必須）を入力: ${guardianFirstName}`)
      
      // Tabキー１回実行して姓（カナ）に入力
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      const guardianLastNameKanaField = page.locator('input:focus').first()
      await guardianLastNameKanaField.fill(studentName.lastNameKana)
      await page.waitForTimeout(500)
      console.log(`✓ 保護者姓（カナ）を入力: ${studentName.lastNameKana}`)
      
      // Tabキー１回実行して名（カナ）に入力
      await page.keyboard.press('Tab')
      await page.waitForTimeout(500)
      const guardianFirstNameKanaField = page.locator('input:focus').first()
      const guardianFirstNameKana = selectedRelationship === '父' ? 'イチロウ' : selectedRelationship === '母' ? 'ハナコ' : 'ジロウ'
      await guardianFirstNameKanaField.fill(guardianFirstNameKana)
      await page.waitForTimeout(500)
      console.log(`✓ 保護者名（カナ）を入力: ${guardianFirstNameKana}`)
      
      console.log(`✓ 保護者姓名を入力: ${studentName.lastName} (続柄: ${selectedRelationship})`)
      await page.waitForTimeout(2000)
      
      // １３　保存ボタンを選択する
      console.log('保存ボタンを選択中...')
      const saveButton = dialog.getByRole('button', { name: '保存' }).first()
      await saveButton.waitFor({ timeout: 5000, state: 'visible' })
      await saveButton.click()
      console.log('✓ 保存ボタンをクリックしました')
      
      // ダイアログが閉じるのを待つ
      await page.waitForTimeout(2000)
      try {
        await dialog.waitFor({ state: 'hidden', timeout: 10000 })
      } catch (e) {
        console.log('ダイアログが既に閉じているか、タイムアウトしました')
      }
      */
      
      // １４〜２３　APIモードで評価対象を作成
      console.log('APIモードで評価対象を作成中...')
      
      const schoolId = '01K10998S5WSMR7Y42JTMV9F34'
      const classId = '01KETKXEVZY3YZZDKF4H4K8A3H'
      const grade = 'middleThird' // 中学3年生
      
      // APIリクエスト用のヘッダー（page.requestは自動的に認証情報を含む）
      const apiHeaders = {
        'Content-Type': 'application/json',
      }
      
      // 成績期間一覧を取得
      console.log('成績期間一覧を取得中...')
      const termsResponse = await page.request.get(`${baseUrl}/api/schools/${schoolId}/evaluation_terms`, {
        headers: apiHeaders,
      })
      
      if (!termsResponse.ok()) {
        const errorText = await termsResponse.text()
        console.error(`エラーレスポンス: ${termsResponse.status()}`)
        console.error(`エラー内容: ${errorText.substring(0, 500)}`)
        throw new Error(`成績期間一覧の取得に失敗しました: ${termsResponse.status()}`)
      }
      
      const termsData = await termsResponse.json()
      console.log('✓ 成績期間一覧を取得しました')
      
      // 成績期間のマッピング（前期/後期 → termId）
      const termMap = new Map<string, string>()
      if (termsData.twoTermEvaluationTerms) {
        for (const term of termsData.twoTermEvaluationTerms) {
          let termName = ''
          if (term.part === 'firstSemester') {
            termName = '前期'
          } else if (term.part === 'secondSemester') {
            termName = '後期'
          }
          if (termName) {
            termMap.set(termName, term.id)
          }
        }
      }
      console.log(`✓ 成績期間マッピング: ${Array.from(termMap.entries()).map(([k, v]) => `${k}=${v}`).join(', ')}`)
      
      // 評価観点を取得（教科一覧も含む）
      console.log('評価観点を取得中...')
      const assessmentPerspectivesResponse = await page.request.get(`${baseUrl}/api/schools/${schoolId}/assessment_perspectives?grade=${grade}`, {
        headers: apiHeaders,
      })
      
      if (!assessmentPerspectivesResponse.ok()) {
        const errorText = await assessmentPerspectivesResponse.text()
        console.error(`エラーレスポンス: ${assessmentPerspectivesResponse.status()}`)
        console.error(`エラー内容: ${errorText.substring(0, 500)}`)
        throw new Error(`評価観点の取得に失敗しました: ${assessmentPerspectivesResponse.status()}`)
      }
      
      const assessmentPerspectivesData = await assessmentPerspectivesResponse.json()
      console.log('✓ 評価観点を取得しました')
      
      // 教科のマッピング（教科名 → {id, assessmentPerspectives}）
      const subjectMap = new Map<string, { id: string, assessmentPerspectives: any[] }>()
      if (assessmentPerspectivesData.subjectActivities) {
        for (const subjectActivity of assessmentPerspectivesData.subjectActivities) {
          if (subjectActivity.assessmentPerspectives && subjectActivity.assessmentPerspectives.length > 0) {
            subjectMap.set(subjectActivity.name, {
              id: subjectActivity.id,
              assessmentPerspectives: subjectActivity.assessmentPerspectives,
            })
          }
        }
      }
      console.log(`✓ 教科マッピング: ${Array.from(subjectMap.keys()).join(', ')}`)
      
      // 生徒一覧を取得
      console.log('生徒一覧を取得中...')
      const studentsResponse = await page.request.get(`${baseUrl}/api/school_classes/${classId}/students/evaluation_targets?grade=${grade}`, {
        headers: apiHeaders,
      })
      
      if (!studentsResponse.ok()) {
        const errorText = await studentsResponse.text()
        console.error(`エラーレスポンス: ${studentsResponse.status()}`)
        console.error(`エラー内容: ${errorText.substring(0, 500)}`)
        throw new Error(`生徒一覧の取得に失敗しました: ${studentsResponse.status()}`)
      }
      
      const studentsData = await studentsResponse.json()
      const students = studentsData.students || []
      console.log(`✓ 生徒一覧を取得しました（${students.length}名）`)
      
      // 評価対象作成関数（API経由）
      async function createAssessmentTargetViaAPI(termName: string, subjectName: string) {
        const combination = `${termName}${subjectName}`
        console.log(`評価対象を作成中（API）: ${combination}`)
        
        const termId = termMap.get(termName)
        if (!termId) {
          throw new Error(`成績期間が見つかりません: ${termName}`)
        }
        
        const subject = subjectMap.get(subjectName)
        if (!subject) {
          throw new Error(`教科が見つかりません: ${subjectName}`)
        }
        
        // 評価観点別の配点を作成（各観点に100を設定）
        const scoreDistributions = subject.assessmentPerspectives.map((perspective: any) => ({
          assessmentPerspectiveId: perspective.id,
          distributionScore: 100,
        }))
        
        // 生徒ごとの素点を作成（各評価観点 × 各生徒）
        const rawScores: any[] = []
        for (const student of students) {
          for (const perspective of subject.assessmentPerspectives) {
            // 0-100のランダムな値を設定
            const randomScore = Math.floor(Math.random() * 101).toString()
            rawScores.push({
              studentId: student.id,
              assessmentPerspectiveId: perspective.id,
              value: randomScore,
            })
          }
        }
        
        // 評価対象を作成
        const createRequest = {
          termId: termId,
          grade: grade,
          subjectActivityId: subject.id,
          schoolClassID: classId,
          name: combination,
          method: 'numericalScoring',
          date: '2025-06-15',
          scoreDistributions: scoreDistributions,
          rawScores: rawScores,
        }
        
        const createResponse = await page.request.post(`${baseUrl}/api/assessment_targets`, {
          headers: apiHeaders,
          data: createRequest,
        })
        
        if (!createResponse.ok()) {
          const errorText = await createResponse.text()
          throw new Error(`評価対象の作成に失敗しました: ${createResponse.status()} ${errorText}`)
        }
        
        const createResult = await createResponse.json()
        console.log(`✓ 評価対象を作成しました: ${combination} (ID: ${createResult.id})`)
        await page.waitForTimeout(1000) // 操作後1秒ディレイ
      }
      
      // 前期国語を作成
      await createAssessmentTargetViaAPI('前期', '国語')
      
      // すべての教科 × 前期/後期の組み合わせを作成
      const terms = ['前期', '後期']
      const availableSubjects = Array.from(subjectMap.keys())
      const createdCombinations = new Set<string>()
      createdCombinations.add('前期国語') // 最初に作成した組み合わせ
      
      console.log(`✓ 選択可能な教科: ${availableSubjects.join(', ')}`)
      
      for (const term of terms) {
        for (const subject of availableSubjects) {
          const combination = `${term}${subject}`
          if (!createdCombinations.has(combination)) {
            await createAssessmentTargetViaAPI(term, subject)
            createdCombinations.add(combination)
            console.log(`✓ 組み合わせを作成: ${combination}`)
          }
        }
      }
      
      console.log(`✓ すべての組み合わせの評価対象の作成が完了しました`)
      console.log(`作成した組み合わせ: ${Array.from(createdCombinations).join(', ')}`)
      
      console.log(`[${testNumber}] テスト結果: OK`)
      await captureTestResult(page, testNumber, '1-1')
      
    } catch (error: any) {
      console.log(`[${testNumber}] テスト結果: NG`)
      console.log(`[${testNumber}] エラー: ${error.message}`)
      await captureTestResult(page, testNumber, '1-1')
      throw error
    }
    
    console.log(`===== [${testNumber}] テスト終了 =====`)
  })
})
