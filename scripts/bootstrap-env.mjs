import fs from 'node:fs/promises'
import path from 'node:path'
import { exec as execCb } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { Client as PgClient } from 'pg'
import { promisify } from 'node:util'

const exec = promisify(execCb)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = process.cwd()

function logOk(msg) {
  console.log(`✅ ${msg}`)
}

function logFail(msg) {
  console.error(`❌ ${msg}`)
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function ensureEnvLocal() {
  const envLocal = path.resolve(projectRoot, '.env.local')
  const envBackup = path.resolve(projectRoot, '.env.local.backup')

  const hasEnv = await fileExists(envLocal)
  const hasBackup = await fileExists(envBackup)

  if (!hasEnv) {
    if (hasBackup) {
      await fs.copyFile(envBackup, envLocal)
    } else {
      logFail('.env.local не найден и отсутствует .env.local.backup')
      process.exit(1)
    }
  }

  logOk('.env.local готов')
  return envLocal
}

function requireEnvVars(requiredKeys) {
  const missing = requiredKeys.filter((k) => !process.env[k] || String(process.env[k]).trim() === '')
  if (missing.length > 0) {
    logFail(`Отсутствуют обязательные переменные: ${missing.join(', ')}`)
    console.error('Добавьте их в .env.local и повторите попытку.')
    process.exit(1)
  }
}

async function checkDatabaseConnection(connectionString) {
  let ok = false
  let lastError

  // Attempt 1: без SSL (подходит для локальной БД/туннеля)
  try {
    const client = new PgClient({ connectionString, connectionTimeoutMillis: 5000 })
    await client.connect()
    await client.query('SELECT 1')
    await client.end()
    ok = true
  } catch (err) {
    lastError = err
  }

  // Attempt 2: c SSL, без проверки CA (частые Managed-Postgres)
  if (!ok) {
    try {
      const client = new PgClient({ connectionString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 })
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      ok = true
    } catch (err) {
      lastError = err
    }
  }

  if (ok) {
    logOk('Database connection OK')
    return true
  }

  logFail('DB CONNECT FAILED')
  console.error('Подключение к базе данных не удалось. Рекомендации:')
  console.error('a) Для verify-full положите корневой CA в ~/.cloud-certs/root.crt и выполните:')
  console.error('   export NODE_EXTRA_CA_CERTS=$HOME/.cloud-certs/root.crt')
  console.error('b) Используйте SSH-туннель на localhost:5433 и замените хост в DATABASE_URL')
  console.error('c) Проверьте sslmode/параметры подключения, логин/пароль, доступ по сети')
  if (lastError) {
    console.error('Причина:', lastError.message || lastError)
  }
  return false
}

async function generatePrisma() {
  try {
    await exec('npx prisma generate --schema prisma/schema.prisma', { cwd: projectRoot })
    logOk('Prisma Client сгенерирован')
    return true
  } catch (err) {
    logFail('Ошибка генерации Prisma Client')
    console.error(err?.stdout || err?.stderr || err?.message || err)
    return false
  }
}

async function main() {
  const envLocalPath = await ensureEnvLocal()

  // Подгружаем переменные окружения из .env.local (приоритетно)
  dotenv.config({ path: envLocalPath })
  // Также подхватить .env (если есть), не перезаписывая уже установленные
  dotenv.config()

  requireEnvVars(['DATABASE_URL', 'SHADOW_DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'])

  const dbUrl = process.env.DATABASE_URL
  const dbOk = await checkDatabaseConnection(dbUrl)

  // Prisma generate независимо от результата проверки БД
  const prismaOk = await generatePrisma()

  // Сводка (строки в требуемом формате)
  // Первая строка уже выведена ранее: "✅ .env.local готов"
  if (dbOk) {
    // уже выведено "✅ Database connection OK"
  } else {
    console.log('❌ DB FAILED')
  }

  if (!prismaOk) {
    // уже выведено сообщение об ошибке; для сводки:
    console.log('❌ Ошибка Prisma Client')
  }
}

main().catch((err) => {
  logFail('Неожиданная ошибка bootstrap')
  console.error(err)
  process.exit(1)
})
