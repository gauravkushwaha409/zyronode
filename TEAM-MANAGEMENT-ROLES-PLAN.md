# Team Management — Roles & Permissions Plan (Phase 1)

## Goal

Replace the dummy **Roles** tab of Team Management (`apps/app/src/routes/_organization-protected/$organization/settings/team-management.tsx`) with a real, backend-driven featureset:

- Fixed **system roles** (seed-only, immutable, no edit/delete).
- **Custom roles** (per-organization, full CRUD).
- **Permissions**: a global registry grouped by module; custom roles are assigned a permission set, system role sets are read-only.

Phases after this (not in scope): Teams/departments, Team members tab + invites, and permission **enforcement** on other endpoints.

## Current state (verified)

- **No role/permission/team models** exist in `apps/server/prisma/schema.prisma`.
- `OrganizationMember` has no role field — members are flat (`@unique([userId, organizationId])`).
- No `role`/`permission` code anywhere in server or app (grep confirmed; only dummy markup in the page).
- API conventions to follow:
  - Tenant-scoped paths already use `/organizations/:organizationId/...` (see `ENDPOINTS.VISITOR` in `apps/app/src/config/endpoints.ts` and visitor controller).
  - Server: Nest module per domain with controller/service/entities/dto; global prefix `/api/v1`; `JwtAuthGuard` + `CurrentUser`; membership re-checked per-route (`organization.service.ts:getMembers` is the pattern).
  - App: feature folders `features/<name>/{types,services,hooks,components,schema}`, endpoints in `config/endpoints.ts`, query keys in `config/query-key.ts`, typed api service extends `BaseAPIService` (`features/organization/services` is the pattern).
  - UI kit available: `DialogWrapper`, `Table`, `Badge`, `EmptyState`, `ConfirmationDialog`, `RadioGroup`, `Input`, `TextArea`, `Toast` (`packages/ui/src/components/...`).

## Phase 1 scope decisions

| Decision | Choice | Why |
|---|---|---|
| System roles shared or per-org? | **Global** (`Role.organizationId = null`) | One immutable template per platform; no per-org duplication on org creation |
| Role ownership | `Role.organizationId` nullable; `isSystem` boolean | `null` = platform role; non-null = org custom role |
| Permissions | Single global `Permission` registry, seeded idempotently on server boot | Fixed reference data; stable `key` as unique identity |
| System roles seeded | `Owner`, `Admin`, `Manager`, `Agent`, `Viewer` | Dummy UI lists Admin/Manager/Agent/Viewer; Owner added as org-creator intent |
| Permission enforcement? | **Phase 2** | Adding an RBAC guard on every org endpoint is a separate, larger change; this phase lands the data model + management UI first |
| Who may manage roles | Any org member (same as `getMembers` today) | Matches current authz; tightening to `team.roles.write` belongs with enforcement |

## Data model (prisma/schema.prisma)

```prisma
model Permission {
  id          String          @id @default(uuid())
  key         String          @unique          // e.g. "team.roles.write"
  name        String
  description String?
  module      String                           // grouping: inbox, visitors, team, settings.*, analytics
  roles       RolePermission[]
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")
  @@map("permissions")
}

model Role {
  id             String               @id @default(uuid())
  organizationId String?              // null → system role (platform-wide, immutable)
  organization   Organization?        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  description    String?
  isSystem       Boolean              @default(false)
  permissions    RolePermission[]
  members        OrganizationMember[]
  createdAt      DateTime             @default(now()) @map("created_at")
  updatedAt      DateTime             @updatedAt @map("updated_at")
  @@index([organizationId])
  @@map("roles")
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
  @@map("role_permissions")
}
```

`Organization` gets a back-relation: `roles Role[]`. `OrganizationMember` gets:

```prisma
roleId String?
role   Role?  @relation(fields: [roleId], references: [id], onDelete: SetNull)
```

Member→role assignment UI is Phase 2, but the field + `getMembers` enrichment (include `role: { select: { id, name, isSystem } }`) ship now so the Team Members tab can render roles later and so a custom role cannot be deleted while assigned.

## Permissions registry (seeded)

Modules grounded in existing surfaces; `key` is `module.resource.verb`.

| module | keys |
|---|---|
| inbox | `inbox.read`, `inbox.write` |
| visitors | `visitors.read`, `visitors.write` |
| analytics | `analytics.read` |
| team | `team.members.read`, `team.members.write`, `team.invitations.read`, `team.invitations.write`, `team.teams.read`, `team.teams.write`, `team.roles.read`, `team.roles.write` |
| settings | `settings.organization.read`, `settings.organization.write`, `settings.widget.read`, `settings.widget.write`, `settings.billing.read`, `settings.billing.write` |

System role matrix:

| Role | Permissions |
|---|---|
| Owner | all |
| Admin | all |
| Manager | team.*, teams, inbox.read/write, visitors.read/write, analytics.read |
| Agent | inbox.read/write, visitors.read/write |
| Viewer | inbox.read, visitors.read, analytics.read |

## Server endpoints (role module)

New Nest domain `apps/server/src/role/`:

- `GET    /organizations/:organizationId/roles`            → list system + custom (custom first, name asc)
- `GET    /organizations/:organizationId/permissions`       → permissions grouped by module
- `POST   /organizations/:organizationId/roles`             → create custom role (name, description?, permissionIds)
- `PATCH  /organizations/:organizationId/roles/:roleId`     → update custom role (name/description/permissions); reject `isSystem`
- `DELETE /organizations/:organizationId/roles/:roleId`     → delete custom role; reject `isSystem` or if any member assigned (400/409)

All guarded by `JwtAuthGuard`, membership re-checked per route (mirror `organization.service.ts:getMembers`). Responses use the standard `ServerResponse` envelope (`{ message, success, statusCode, data }`) via an existing helper where one exists.

Files: `role.module.ts` (imports `AuthModule`; exports roles+permissions via `OrganizationMember` include), `role.controller.ts`, `role.service.ts`, `entities/role.entity.ts`, `entities/permission.entity.ts`, `dto/create-role.dto.ts`, `dto/update-role.dto.ts`, `dto/set-role-permissions.dto.ts`, and a `role-seed.service.ts` (`OnModuleInit`, `upsert` permissions + system roles idempotently, rejects/guards system rows in mutations).

Migration: `pnpm --filter server exec prisma migrate dev --name add_roles_and_permissions` (needs local DB), then `prisma generate`.

## App integration

Feature: `apps/app/src/features/team-management/` (hosts future tabs; roles first).

- `config/endpoints.ts`: add `ORGANIZATION.ROLES()`, `.ROLE_DETAIL()`, `.ROLE_PERMISSIONS()`, `.PERMISSIONS()` under `/organizations/:organizationId/...`
- `config/query-key.ts`: `ROLE.LIST(orgId)`, `ROLE.PERMISSIONS(orgId)`
- `types/roles.types.ts`: `RoleItem` (id, name, description, isSystem, permissions[]), `PermissionItem` (id, key, name, module), `RoleListResponse`, `PermissionListResponse`
- `services/team-management-api.service.ts` (extends `BaseAPIService`): listRoles, listPermissions, createRole, updateRole, deleteRole
- `hooks/query/`: `useRolesQuery`, `usePermissionsQuery`
- `hooks/mutation/`: `useCreateRoleMutation`, `useUpdateRoleMutation`, `useDeleteRoleMutation` (invalidate `ROLE.LIST`)
- `schema/create-role.schema.ts` (zod): name required, description optional, permissionIds ≥ 1
- `components/roles/roles-tab.tsx`: real table replacing `RolesTab`:
  - cols: Role Name (+ System/Custom badge), Description, Permissions count, actions
  - System rows: view-only (open read-only permission panel)
  - Custom rows: Edit / Delete (ConfirmationDialog)
  - "Create Role" button → DialogWrapper form: name, description, permission checkbox groups by module (checked for system roles → read-only view)

Wire `team-management.tsx` `RolesTab` → `TeamRolesTab` component with `useParams($organization).organizationId`, loading/error/empty states via `EmptyState`.

Leave Team Invitation / Members / Teams tabs as dummy (Phase 2).

## Verification

1. `pnpm --filter server exec tsc --noEmit`
2. `pnpm check-types` (app)
3. `pnpm lint` (biome)
4. Migration applies + `prisma generate` succeeds
5. Manual swagger check: list roles shows seeded system set; system role PATCH/DELETE rejected; custom role create → assign permissions → update → delete works; assigned custom role delete rejected

## Risks / open items

- **No permission enforcement yet** — roles are data until Phase 2 guard (`RolesGuard` + `@RequirePermission("team.roles.write")` decorator). Flagged deliberately.
- Migration requires a running DB (`prisma migrate dev`).
- Role delete-protection when members reference it (`onDelete: SetNull` on membership keeps members safe if we ever allow delete).
- Permission registry growth should stay additive; `key` uniqueness prevents drift.