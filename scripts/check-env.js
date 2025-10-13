const fs = require('fs');
const path = require('path');

function checkEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Файл .env не найден');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Проверка DATABASE_URL
  if (!envContent.includes('DATABASE_URL=')) {
    console.error('❌ DATABASE_URL не найден в .env');
    process.exit(1);
  }
  
  // Проверка sslmode=verify-full
  if (!envContent.includes('sslmode=verify-full')) {
    console.error('❌ sslmode=verify-full не найден в DATABASE_URL');
    process.exit(1);
  }
  
  // Проверка на необработанные спецсимволы
  const specialChars = ['(', ')', '!', '*'];
  for (const char of specialChars) {
    if (envContent.includes(char) && !envContent.includes(encodeURIComponent(char))) {
      console.error(`❌ Найден необработанный спецсимвол: ${char}`);
      console.error('   Используйте URL-кодирование:', encodeURIComponent(char));
      process.exit(1);
    }
  }
  
  console.log('✅ .env файл корректен');
}

checkEnv();