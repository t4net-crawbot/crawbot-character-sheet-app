import { test, expect, Page } from '@playwright/test'

const BASE = 'http://localhost:3000'
const API  = 'http://localhost:8080'

async function waitForApp(page: Page) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
}

// Click the first card that has an exact text match for the name
async function clickCard(page: Page, name: string) {
  await page.getByText(name, { exact: true }).first().click()
}

// ── API tests ─────────────────────────────────────────────────────────────────

test('API: health endpoint returns ok + connected', async ({ request }) => {
  const res  = await request.get(`${API}/api/health`)
  const body = await res.json()
  expect(res.status()).toBe(200)
  expect(body.status).toBe('ok')
  expect(body.database).toBe('connected')
})

test('API: rules/classes returns 13 classes', async ({ request }) => {
  const res  = await request.get(`${API}/api/rules/classes`)
  const body = await res.json()
  expect(res.status()).toBe(200)
  expect(Array.isArray(body)).toBeTruthy()
  expect(body.length).toBe(13)
  const ids = body.map((c: any) => c.id)
  expect(ids).toContain('barbarian')
  expect(ids).toContain('wizard')
  expect(ids).toContain('vanguard')
})

test('API: rules/lineages returns 6 lineages', async ({ request }) => {
  const res  = await request.get(`${API}/api/rules/lineages`)
  expect(res.status()).toBe(200)
  expect((await res.json()).length).toBe(6)
})

test('API: rules/heritages returns 8 heritages', async ({ request }) => {
  const res  = await request.get(`${API}/api/rules/heritages`)
  expect(res.status()).toBe(200)
  expect((await res.json()).length).toBe(8)
})

test('API: rules/backgrounds returns 6 backgrounds', async ({ request }) => {
  const res  = await request.get(`${API}/api/rules/backgrounds`)
  expect(res.status()).toBe(200)
  expect((await res.json()).length).toBe(6)
})

test('API: character CRUD', async ({ request }) => {
  const create = await request.post(`${API}/api/characters`, {
    data: {
      name: 'CRUD Test Hero', lineage: 'dwarf', heritage: 'stone',
      class: 'fighter', background: 'soldier', level: 1,
      str_score: 16, dex_score: 12, con_score: 14,
      int_score: 10, wis_score: 10, cha_score: 8,
      hp_max: 12, hp_current: 12,
      saving_throw_profs: ['STR','CON'], skill_profs: ['Athletics','Survival'],
    }
  })
  expect(create.status()).toBe(201)
  const char = await create.json()
  expect(char.id).toBeTruthy()
  expect(char.name).toBe('CRUD Test Hero')

  const get = await request.get(`${API}/api/characters/${char.id}`)
  expect(get.status()).toBe(200)

  const list = await request.get(`${API}/api/characters`)
  expect((await list.json()).find((c: any) => c.id === char.id)).toBeTruthy()

  const patch = await request.patch(`${API}/api/characters/${char.id}`, {
    data: { hp_current: 8, luck_points: 2 }
  })
  expect(patch.status()).toBe(200)
  expect((await patch.json()).hp_current).toBe(8)

  await request.delete(`${API}/api/characters/${char.id}`)
  expect((await request.get(`${API}/api/characters/${char.id}`)).status()).toBe(404)
})

// ── UI: Dashboard ────────────────────────────────────────────────────────────

test('UI: dashboard loads with title and subtitle', async ({ page }) => {
  await waitForApp(page)
  await expect(page).toHaveTitle(/Tales of the Valiant/)
  await expect(page.locator('h1')).toContainText('Tales of the Valiant')
  await expect(page.getByText('Character Compendium')).toBeVisible()
})

test('UI: dashboard shows Create Character button', async ({ page }) => {
  await waitForApp(page)
  // The button text is "+ Create Character"
  await expect(page.getByRole('button', { name: /create character/i }).first()).toBeVisible()
})

test('UI: dashboard has no JS errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await waitForApp(page)
  expect(errors).toHaveLength(0)
})

test('UI: clicking Create Character navigates to /create', async ({ page }) => {
  await waitForApp(page)
  await page.getByRole('button', { name: /create character/i }).first().click()
  await expect(page).toHaveURL(/\/create/)
  await expect(page.getByText('Create Your Character')).toBeVisible()
})

// ── UI: Wizard ────────────────────────────────────────────────────────────────

test('UI: wizard step indicator shows all steps', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })
  // Step labels are in spans inside the step indicator
  await expect(page.locator('span:text-is("Lineage")').first()).toBeVisible()
  await expect(page.locator('span:text-is("Class")').first()).toBeVisible()
  await expect(page.locator('span:text-is("Review")').first()).toBeVisible()
})

test('UI: wizard step 1 - lineage cards all load', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { name: 'Choose Your Lineage' })).toBeVisible()
  // Check all 6 lineages are present (exact card names)
  for (const name of ['Beastkin', 'Dwarf', 'Elf', 'Human', 'Orc', 'Smallfolk']) {
    await expect(page.locator(`div.font-bold:text-is("${name}")`).first()).toBeVisible()
  }
})

test('UI: wizard - Continue disabled until lineage + heritage selected', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })
  const btn = page.getByRole('button', { name: /continue/i })
  await expect(btn).toBeDisabled()

  // Select lineage only — still disabled (need heritage too)
  await clickCard(page, 'Elf')
  await page.waitForTimeout(400)
  await expect(btn).toBeDisabled()

  // Select heritage — now enabled
  await clickCard(page, 'Grove')
  await expect(btn).toBeEnabled()
})

test('UI: wizard - can navigate lineage → class step', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })
  await clickCard(page, 'Dwarf')
  await page.waitForTimeout(400)
  await expect(page.getByRole('heading', { name: 'Choose Your Heritage' })).toBeVisible()
  await clickCard(page, 'Stone')
  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByRole('heading', { name: 'Choose Your Class' })).toBeVisible()
})

test('UI: wizard - class cards show hit dice and saves', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })
  await clickCard(page, 'Dwarf')
  await page.waitForTimeout(400)
  await clickCard(page, 'Stone')
  await page.getByRole('button', { name: /continue/i }).click()

  await expect(page.getByRole('heading', { name: 'Choose Your Class' })).toBeVisible()
  // All 13 classes (check a subset for speed)
  for (const name of ['Barbarian','Fighter','Wizard','Vanguard','Rogue']) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
  }
  // Hit die badges
  await expect(page.getByText('d12', { exact: true }).first()).toBeVisible() // Barbarian
  await expect(page.getByText('d10', { exact: true }).first()).toBeVisible() // Fighter
})

test('UI: wizard - full flow creates a character end-to-end', async ({ page }) => {
  await page.goto(`${BASE}/create`, { waitUntil: 'networkidle' })

  // Step 1: Lineage + Heritage
  await clickCard(page, 'Human')
  await page.waitForTimeout(400)
  await clickCard(page, 'Cosmopolitan')
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 2: Class
  await page.waitForSelector('h2:text("Choose Your Class")')
  await clickCard(page, 'Fighter')
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 3: Background + skills
  await page.waitForSelector('h2:text("Choose Your Background")')
  await clickCard(page, 'Soldier')
  await page.waitForTimeout(400)
  // Pick 2 skills (Athletics and Survival)
  await page.locator('button:text("Athletics")').click()
  await page.locator('button:text("Survival")').click()
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 4: Stats (just continue)
  await page.waitForSelector('h2:text("Assign Ability Scores")')
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 5: Talent
  await page.waitForSelector('h2:text("Choose Your Talent")')
  // Click the first talent card
  await page.locator('div.cursor-pointer').filter({ hasText: /Combat|Field|Conditioning/ }).first().click()
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 6: Story (optional, just continue)
  await page.waitForSelector('h2:text("Your Story")')
  await page.getByRole('button', { name: /continue/i }).click()

  // Step 7: Review — enter name and forge
  await page.waitForSelector('h2:text("Review Your Character")')
  await page.getByPlaceholder(/hero's name/i).fill('Ser Testington')
  await page.getByRole('button', { name: /forge your legend/i }).click()

  // Should redirect to /characters/:id
  await expect(page).toHaveURL(/\/characters\//, { timeout: 10000 })
  await expect(page.getByText('Ser Testington')).toBeVisible()
})

// ── UI: Character Sheet ───────────────────────────────────────────────────────

test('UI: character sheet shows all sections', async ({ page, request }) => {
  const res = await request.post(`${API}/api/characters`, {
    data: {
      name: 'Sheet Test Hero', lineage: 'elf', heritage: 'grove', class: 'wizard',
      background: 'scholar', level: 1,
      str_score: 8, dex_score: 14, con_score: 12,
      int_score: 16, wis_score: 13, cha_score: 10,
      hp_max: 7, hp_current: 7,
      saving_throw_profs: ['INT','WIS'], skill_profs: ['Arcana','History'],
    }
  })
  const char = await res.json()
  await page.goto(`${BASE}/characters/${char.id}`, { waitUntil: 'networkidle' })

  await expect(page.getByText('Sheet Test Hero')).toBeVisible()
  await expect(page.locator('span.px-2.py-0\\.5').filter({ hasText: 'wizard' })).toBeVisible()
  await expect(page.locator('text=STR').first()).toBeVisible()
  await expect(page.locator('text=Perception').first()).toBeVisible()
  await expect(page.locator('text=Hit Points')).toBeVisible()
  await expect(page.locator('text=Luck')).toBeVisible()
  await expect(page.locator('text=Spellcasting')).toBeVisible()
  // HP current should be a button showing "7"
  await expect(page.getByRole('button', { name: '7' })).toBeVisible()

  await request.delete(`${API}/api/characters/${char.id}`)
})

test('UI: luck coins are interactive', async ({ page, request }) => {
  const res = await request.post(`${API}/api/characters`, {
    data: {
      name: 'Luck Test', lineage: 'human', heritage: 'cosmopolitan',
      class: 'rogue', background: 'criminal', level: 1,
      str_score: 10, dex_score: 16, con_score: 12,
      int_score: 12, wis_score: 10, cha_score: 10,
      hp_max: 9, hp_current: 9, luck_points: 0,
    }
  })
  const char = await res.json()
  await page.goto(`${BASE}/characters/${char.id}`, { waitUntil: 'networkidle' })

  // Click first luck coin (empty → fill)
  await page.locator('button[title]').first().click()
  await page.waitForTimeout(700)

  const updated = await request.get(`${API}/api/characters/${char.id}`)
  expect((await updated.json()).luck_points).toBeGreaterThan(0)

  await request.delete(`${API}/api/characters/${char.id}`)
})

test('UI: HP quick buttons work', async ({ page, request }) => {
  const res = await request.post(`${API}/api/characters`, {
    data: {
      name: 'HP Test', lineage: 'orc', heritage: 'slayer',
      class: 'barbarian', background: 'soldier', level: 1,
      str_score: 16, dex_score: 12, con_score: 16,
      int_score: 8, wis_score: 10, cha_score: 8,
      hp_max: 14, hp_current: 14,
    }
  })
  const char = await res.json()
  await page.goto(`${BASE}/characters/${char.id}`, { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: '−5' }).click()
  await page.waitForTimeout(700)

  const updated = await request.get(`${API}/api/characters/${char.id}`)
  expect((await updated.json()).hp_current).toBe(9)

  await request.delete(`${API}/api/characters/${char.id}`)
})

test('UI: back button returns to dashboard', async ({ page, request }) => {
  const res = await request.post(`${API}/api/characters`, {
    data: {
      name: 'Nav Test', lineage: 'smallfolk', heritage: 'cottage',
      class: 'bard', background: 'entertainer', level: 1,
      str_score: 8, dex_score: 14, con_score: 12,
      int_score: 12, wis_score: 10, cha_score: 16,
      hp_max: 9, hp_current: 9,
    }
  })
  const char = await res.json()
  await page.goto(`${BASE}/characters/${char.id}`, { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: /back/i }).first().click()
  await expect(page).toHaveURL(BASE + '/')

  await request.delete(`${API}/api/characters/${char.id}`)
})
