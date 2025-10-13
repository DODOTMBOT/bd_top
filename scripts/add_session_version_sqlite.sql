-- SQLite фикс: добавляем колонку sessionVersion в таблицу User
-- Проверяем существование колонки и добавляем только если её нет
PRAGMA table_info(User);

-- Добавляем колонку sessionVersion с дефолтом 0
ALTER TABLE User ADD COLUMN sessionVersion INTEGER DEFAULT 0;

-- Проверяем, что колонка добавилась
PRAGMA table_info(User);
-- Проверяем существование колонки и добавляем только если её нет
PRAGMA table_info(User);

-- Добавляем колонку sessionVersion с дефолтом 0
ALTER TABLE User ADD COLUMN sessionVersion INTEGER DEFAULT 0;

-- Проверяем, что колонка добавилась
PRAGMA table_info(User);
