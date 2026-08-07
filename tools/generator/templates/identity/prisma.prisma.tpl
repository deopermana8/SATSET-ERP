model IdentityUser {
  id                String   @id @default(uuid())
  username          String   @unique
  email             String   @unique
  phone             String?  @unique
  passwordHash      String
  passwordChangedAt DateTime?
  passwordExpiresAt DateTime?
  mfaEnabled        Boolean  @default(false)
  mfaSecret         String?
  isActive          Boolean  @default(true)
  isDeleted         Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  roles             IdentityUserRole[]
  sessions          IdentitySession[]
  passwordHistory   IdentityPasswordHistory[]
  auditLogs         IdentityAuditLog[]
}

model IdentityRole {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       IdentityUserRole[]
  permissions IdentityRolePermission[]
}

model IdentityPermission {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  parentId    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  parent      IdentityPermission?       @relation("IdentityPermissionTree", fields: [parentId], references: [id])
  children    IdentityPermission[]      @relation("IdentityPermissionTree")
  roles       IdentityRolePermission[]
}

model IdentityUserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())

  user      IdentityUser @relation(fields: [userId], references: [id])
  role      IdentityRole @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])
}

model IdentityRolePermission {
  id           String   @id @default(uuid())
  roleId       String
  permissionId String
  createdAt    DateTime @default(now())

  role         IdentityRole       @relation(fields: [roleId], references: [id])
  permission   IdentityPermission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])
}

model IdentitySession {
  id            String   @id @default(uuid())
  userId        String
  refreshToken  String   @unique
  deviceId      String
  deviceName    String?
  ipAddress     String?
  userAgent     String?
  rememberMe    Boolean  @default(false)
  expiresAt     DateTime
  revokedAt     DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          IdentityUser @relation(fields: [userId], references: [id])
}

model IdentityPasswordHistory {
  id           String   @id @default(uuid())
  userId        String
  passwordHash  String
  createdAt     DateTime @default(now())

  user          IdentityUser @relation(fields: [userId], references: [id])
}

model IdentityAuditLog {
  id           String   @id @default(uuid())
  userId        String?
  action        String
  entityName    String
  entityId      String?
  status        String
  metadata      String
  createdAt     DateTime @default(now())

  user          IdentityUser? @relation(fields: [userId], references: [id])
}
