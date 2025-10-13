-- Delete existing data
DELETE FROM "Point";

-- DropTable
DROP TABLE "Point";

-- CreateTable
CREATE TABLE "Point" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "partnerUserId" TEXT NOT NULL,
    "pointUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Point_partnerUserId_fkey" FOREIGN KEY ("partnerUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Point_pointUserId_fkey" FOREIGN KEY ("pointUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Point_partnerUserId_idx" ON "Point"("partnerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Point_pointUserId_key" ON "Point"("pointUserId");
