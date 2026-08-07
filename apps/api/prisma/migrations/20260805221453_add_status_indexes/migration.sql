-- CreateIndex
CREATE INDEX "WorkspaceRecord_status_idx" ON "WorkspaceRecord"("status");

-- CreateIndex
CREATE INDEX "guide_wisata_status_idx" ON "guide_wisata"("status");

-- CreateIndex
CREATE INDEX "hotel_status_idx" ON "hotel"("status");

-- CreateIndex
CREATE INDEX "kendaraan_status_idx" ON "kendaraan"("status");

-- CreateIndex
CREATE INDEX "paket_wisata_status_idx" ON "paket_wisata"("status");
