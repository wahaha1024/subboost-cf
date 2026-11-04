CREATE TABLE "LocalAdmin" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastLoginAt" TIMESTAMP(3),

  CONSTRAINT "LocalAdmin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "encryptedUrls" TEXT NOT NULL,
  "encryptedNodes" TEXT NOT NULL,
  "encryptedConfig" TEXT NOT NULL,
  "encryptedSubscriptionInfo" TEXT,
  "autoUpdateInterval" INTEGER,
  "cacheExpiresAt" TIMESTAMP(3),
  "lastAccessedAt" TIMESTAMP(3),
  "lastUpdatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionAutoUpdateState" (
  "subscriptionId" TEXT NOT NULL,
  "externalFailureCount" INTEGER NOT NULL DEFAULT 0,
  "failureSourceState" TEXT,
  "lastFailedAt" TIMESTAMP(3),
  "lastAttemptedAt" TIMESTAMP(3),
  "disabledAt" TIMESTAMP(3),
  "disabledReason" TEXT,
  "disabledPreviousInterval" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SubscriptionAutoUpdateState_pkey" PRIMARY KEY ("subscriptionId")
);

CREATE UNIQUE INDEX "LocalAdmin_username_key" ON "LocalAdmin"("username");
CREATE UNIQUE INDEX "Subscription_token_key" ON "Subscription"("token");
CREATE INDEX "Subscription_ownerId_idx" ON "Subscription"("ownerId");
CREATE INDEX "Subscription_lastUpdatedAt_idx" ON "Subscription"("lastUpdatedAt");

ALTER TABLE "Subscription"
  ADD CONSTRAINT "Subscription_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "LocalAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SubscriptionAutoUpdateState"
  ADD CONSTRAINT "SubscriptionAutoUpdateState_subscriptionId_fkey"
  FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
