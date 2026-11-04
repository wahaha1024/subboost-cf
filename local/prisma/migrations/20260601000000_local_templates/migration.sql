CREATE TABLE "LocalTemplate" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "encryptedConfig" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LocalTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LocalTemplate_ownerId_idx" ON "LocalTemplate"("ownerId");
CREATE INDEX "LocalTemplate_updatedAt_idx" ON "LocalTemplate"("updatedAt");

ALTER TABLE "LocalTemplate"
  ADD CONSTRAINT "LocalTemplate_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "LocalAdmin"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
