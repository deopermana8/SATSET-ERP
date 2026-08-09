-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "village" TEXT,
    "district" TEXT,
    "regency" TEXT,
    "skNumber" TEXT,
    "foundedYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_settings" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_widget_settings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "widgetId" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "width" TEXT NOT NULL DEFAULT 'md',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_widget_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "module_settings_organizationId_idx" ON "module_settings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "module_settings_organizationId_moduleKey_key" ON "module_settings"("organizationId", "moduleKey");

-- CreateIndex
CREATE INDEX "dashboard_widget_settings_userId_idx" ON "dashboard_widget_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_widget_settings_userId_widgetId_key" ON "dashboard_widget_settings"("userId", "widgetId");

-- AddForeignKey
ALTER TABLE "module_settings" ADD CONSTRAINT "module_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
