/*
  Warnings:

  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePageAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdminUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RolePageAccess";
PRAGMA foreign_keys=on;
