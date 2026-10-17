export const PERMISSIONS = {
  attendance: [
    "attendance:create",
    "attendance:mark-attended",
    "attendance:mark-no-show",
    "attendance:read",
  ],
  city: ["city:create", "city:delete", "city:read", "city:update"],
  circuits: ["circuit:create", "circuit:delete", "circuit:read", "circuit:update"],
  congregation: [
    "congregation:create",
    "congregation:delete",
    "congregation:read",
    "congregation:update",
  ],
  enrollment: [
    "enrollment:confirm-contact",
    "enrollment:contact-attempt",
    "enrollment:create",
    "enrollment:delete",
    "enrollment:files:read",
    "enrollment:files:upload",
    "enrollment:list",
    "enrollment:read",
    "enrollment:update",
  ],
  meeting: [
    "meeting:cancel",
    "meeting:complete",
    "meeting:create",
    "meeting:delete",
    "meeting:read",
    "meeting:start",
    "meeting:update",
  ],
  participant: ["participant:read", "participant:update"],
  permission: ["permission:read"],
  place: [
    "place:create",
    "place:delete",
    "place:files:read",
    "place:files:upload",
    "place:read",
    "place:update",
  ],
  profile: ["profile:read", "profile:update"],
  role: [
    "role:create",
    "role:delete",
    "role:permissions:read",
    "role:permissions:update",
    "role:read",
  ],
  training: [
    "training:create",
    "training:delete",
    "training:files:delete",
    "training:files:read",
    "training:files:upload",
    "training:read",
    "training:update",
  ],
  turns: ["turn:read", "turn:create", "turn:update", "turn:delete"],
  user: ["user:assign-role", "user:delete", "user:invite", "user:read", "user:update"],
  tenant: [
    "tenant:read",
    "tenant:update",
    "tenant:privilege-limits:read",
    "tenant:privilege-limits:update",
  ],
  settings: ["setting:read", "setting:update"],
  zone: ["zone:create", "zone:delete", "zone:read", "zone:update"],
} as const;

type PermissionValues = typeof PERMISSIONS;
type ModuleKey = keyof PermissionValues;
export type Permission = PermissionValues[ModuleKey][number];

export function getModulePermissions<K extends ModuleKey>(
  module: K
): readonly PermissionValues[K][number][] {
  return PERMISSIONS[module];
}

export const MODULE_KEYS = Object.keys(PERMISSIONS) as ModuleKey[];
