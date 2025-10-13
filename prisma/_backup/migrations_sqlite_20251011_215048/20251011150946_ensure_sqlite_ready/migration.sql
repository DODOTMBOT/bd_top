-- CreateTable
CREATE TABLE "RolePageAccess" (
    "roleKey" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("roleKey", "path")
);

-- CreateIndex
CREATE INDEX "RolePageAccess_roleKey_idx" ON "RolePageAccess"("roleKey");

-- CreateIndex
CREATE INDEX "RolePageAccess_path_idx" ON "RolePageAccess"("path");
