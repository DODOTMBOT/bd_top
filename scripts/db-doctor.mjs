#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { createConnection } from 'net';
import { parse } from 'url';
import { homedir } from 'os';
import { join } from 'path';
import pkg from 'pg';
import dotenv from 'dotenv';

const { Client } = pkg;

// Цвета для вывода
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStatus(test, status, details = '') {
  const icon = status === 'OK' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'OK' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${icon} ${test}: ${status}${details ? ` (${details})` : ''}`, color);
}

// Загрузка переменных окружения
function loadEnvVars() {
  const prismaEnvPath = 'prisma/.env';
  const localEnvPath = '.env.local';
  
  let envVars = {};
  
  // Сначала пробуем prisma/.env
  if (existsSync(prismaEnvPath)) {
    const prismaEnv = dotenv.parse(readFileSync(prismaEnvPath, 'utf8'));
    envVars = { ...envVars, ...prismaEnv };
  }
  
  // Затем .env.local
  if (existsSync(localEnvPath)) {
    const localEnv = dotenv.parse(readFileSync(localEnvPath, 'utf8'));
    envVars = { ...envVars, ...localEnv };
  }
  
  if (!envVars.DATABASE_URL) {
    log('❌ DATABASE_URL не найден в prisma/.env или .env.local', 'red');
    process.exit(1);
  }
  
  return envVars;
}

// Парсинг DATABASE_URL
function parseDatabaseUrl(url) {
  try {
    const parsed = parse(url, true);
    const sslmode = parsed.query.sslmode || 'prefer';
    const sslrootcert = parsed.query.sslrootcert;
    
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 5432,
      database: parsed.pathname?.slice(1) || 'postgres',
      user: parsed.auth?.split(':')[0],
      password: parsed.auth?.split(':')[1],
      sslmode,
      sslrootcert
    };
  } catch (error) {
    throw new Error(`Неверный формат DATABASE_URL: ${error.message}`);
  }
}

// Проверка TCP подключения
async function checkTcpConnection(host, port) {
  return new Promise((resolve) => {
    const socket = createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({ status: 'FAIL', details: 'timeout' });
    }, 5000);
    
    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ status: 'OK' });
    });
    
    socket.on('error', (error) => {
      clearTimeout(timeout);
      resolve({ status: 'FAIL', details: error.code || error.message });
    });
  });
}

// Проверка TLS подключения
async function checkTlsConnection(dbConfig, sslRootCert) {
  try {
    let sslConfig = {};
    
    if (dbConfig.sslmode === 'verify-full') {
      if (!sslRootCert || !existsSync(sslRootCert)) {
        return { status: 'FAIL', details: 'NO CA (ожидается DB_SSL_ROOT_CERT=...)' };
      }
      
      sslConfig = {
        ca: readFileSync(sslRootCert),
        rejectUnauthorized: true,
        servername: dbConfig.host
      };
    } else if (dbConfig.sslmode === 'require') {
      sslConfig = { rejectUnauthorized: false };
    } else if (dbConfig.sslmode === 'disable') {
      sslConfig = false;
    }
    
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: sslConfig
    });
    
    await client.connect();
    await client.end();
    
    return { status: 'OK' };
  } catch (error) {
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      return { status: 'FAIL', details: 'TCP connection failed' };
    } else if (error.message.includes('certificate') || error.message.includes('hostname')) {
      return { status: 'FAIL', details: 'HOSTNAME MISMATCH (нужно verify-full + корректный CA/hostname)' };
    } else if (error.message.includes('handshake') || error.message.includes('SSL')) {
      return { status: 'FAIL', details: 'HANDSHAKE FAIL (возможен требуемый verify-full)' };
    } else if (error.message.includes('authentication')) {
      return { status: 'FAIL', details: 'AUTH FAIL (неверные учетные данные)' };
    } else {
      return { status: 'FAIL', details: error.message };
    }
  }
}

// Проверка SQL запроса
async function checkSqlQuery(dbConfig, sslRootCert, testQuery) {
  try {
    let sslConfig = {};
    
    if (dbConfig.sslmode === 'verify-full') {
      if (sslRootCert && existsSync(sslRootCert)) {
        sslConfig = {
          ca: readFileSync(sslRootCert),
          rejectUnauthorized: true,
          servername: dbConfig.host
        };
      }
    } else if (dbConfig.sslmode === 'require') {
      sslConfig = { rejectUnauthorized: false };
    } else if (dbConfig.sslmode === 'disable') {
      sslConfig = false;
    }
    
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      ssl: sslConfig
    });
    
    const startTime = Date.now();
    await client.connect();
    const result = await client.query(testQuery);
    const duration = Date.now() - startTime;
    await client.end();
    
    return { status: 'OK', details: `${duration} ms` };
  } catch (error) {
    if (error.message.includes('does not exist')) {
      return { status: 'FAIL', details: 'DATABASE NOT FOUND' };
    } else if (error.message.includes('authentication')) {
      return { status: 'FAIL', details: 'AUTH FAIL (неверные учетные данные)' };
    } else {
      return { status: 'FAIL', details: error.message };
    }
  }
}

// Основная функция диагностики
async function runDiagnostics() {
  log('🔍 Диагностика подключения к PostgreSQL', 'bold');
  log('=' .repeat(50), 'blue');
  
  // Загрузка переменных окружения
  const envVars = loadEnvVars();
  const dbUrl = envVars.DATABASE_URL;
  const sslRootCert = envVars.DB_SSL_ROOT_CERT || join(homedir(), '.postgresql', 'root.crt');
  const testQuery = envVars.DB_TEST_QUERY || 'select 1;';
  
  log(`📋 DATABASE_URL: ${dbUrl.replace(/:[^:@]*@/, ':***@')}`, 'blue');
  log(`📋 SSL Root Cert: ${sslRootCert}`, 'blue');
  log(`📋 Test Query: ${testQuery}`, 'blue');
  log('');
  
  // Парсинг URL
  let dbConfig;
  try {
    dbConfig = parseDatabaseUrl(dbUrl);
  } catch (error) {
    logStatus('URL PARSE', 'FAIL', error.message);
    return;
  }
  
  // Проверка TCP подключения
  log('🌐 Проверка TCP подключения...', 'blue');
  const tcpResult = await checkTcpConnection(dbConfig.host, dbConfig.port);
  logStatus('TCP', tcpResult.status, tcpResult.details);
  
  if (tcpResult.status !== 'OK') {
    log('\n❌ Проблема: TCP подключение недоступно', 'red');
    log('💡 Что делать:', 'yellow');
    log('   1. Проверьте доступность хоста и порта', 'yellow');
    log('   2. Настройте SSH туннель: ssh -NT -L 5433:<host>:5432 user@bastion', 'yellow');
    log('   3. Используйте localhost:5433 с sslmode=disable в DATABASE_URL', 'yellow');
    return;
  }
  
  // Проверка TLS подключения
  log('\n🔒 Проверка TLS подключения...', 'blue');
  const tlsResult = await checkTlsConnection(dbConfig, sslRootCert);
  logStatus('TLS', tlsResult.status, tlsResult.details);
  
  // Проверка SQL запроса
  log('\n💾 Проверка SQL запроса...', 'blue');
  const sqlResult = await checkSqlQuery(dbConfig, sslRootCert, testQuery);
  logStatus('SQL', sqlResult.status, sqlResult.details);
  
  // Сводка
  log('\n📊 Сводка:', 'bold');
  
  if (tcpResult.status === 'OK' && tlsResult.status === 'OK' && sqlResult.status === 'OK') {
    log('✅ Все проверки пройдены успешно!', 'green');
  } else {
    let problem = '';
    let solutions = [];
    
    if (tcpResult.status !== 'OK') {
      problem = 'TCP подключение недоступно';
      solutions = [
        'Проверьте доступность хоста и порта',
        'Настройте SSH туннель: ssh -NT -L 5433:<host>:5432 user@bastion',
        'Используйте localhost:5433 с sslmode=disable в DATABASE_URL'
      ];
    } else if (tlsResult.status !== 'OK') {
      if (tlsResult.details.includes('NO CA')) {
        problem = 'Отсутствует SSL сертификат';
        solutions = [
          'Положите CA в ~/.postgresql/root.crt: mkdir -p ~/.postgresql && cp root.crt ~/.postgresql/root.crt',
          'Переключите sslmode на require или disable',
          'Используйте SSH туннель с sslmode=disable'
        ];
      } else if (tlsResult.details.includes('HOSTNAME MISMATCH')) {
        problem = 'Несоответствие имени хоста в сертификате';
        solutions = [
          'Используйте правильный CA сертификат для хоста',
          'Переключите sslmode на require',
          'Используйте SSH туннель с sslmode=disable'
        ];
      } else {
        problem = 'Ошибка TLS handshake';
        solutions = [
          'Проверьте SSL сертификат',
          'Переключите sslmode на require или disable',
          'Используйте SSH туннель с sslmode=disable'
        ];
      }
    } else if (sqlResult.status !== 'OK') {
      problem = 'Ошибка SQL запроса';
      solutions = [
        'Проверьте учетные данные',
        'Проверьте существование базы данных',
        'Проверьте права доступа пользователя'
      ];
    }
    
    log(`❌ Проблема: ${problem}`, 'red');
    log('💡 Что делать:', 'yellow');
    solutions.forEach((solution, index) => {
      log(`   ${index + 1}. ${solution}`, 'yellow');
    });
  }
}

// Запуск диагностики
runDiagnostics().catch(error => {
  log(`❌ Ошибка диагностики: ${error.message}`, 'red');
  process.exit(1);
});

