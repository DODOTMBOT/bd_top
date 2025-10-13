-- Добавляем колонку sessionVersion, если её нет (SQLite)
-- Проверяем существование колонки и добавляем только если её нет
PRAGMA table_info(User);

-- Добавляем колонку sessionVersion с дефолтом 1
ALTER TABLE User ADD COLUMN sessionVersion INTEGER DEFAULT 1;
-- Проверяем существование колонки и добавляем только если её нет
PRAGMA table_info(User);

-- Добавляем колонку sessionVersion с дефолтом 1
ALTER TABLE User ADD COLUMN sessionVersion INTEGER DEFAULT 1;
