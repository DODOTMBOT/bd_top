/*
  Warnings:

  - Added the required column `updatedAt` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MenuItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MenuItem" ("id", "label", "order", "parentId", "path", "visible") SELECT "id", "label", "order", "parentId", "path", "visible" FROM "MenuItem";
DROP TABLE "MenuItem";
ALTER TABLE "new_MenuItem" RENAME TO "MenuItem";
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");
CREATE INDEX "MenuItem_path_idx" ON "MenuItem"("path");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
