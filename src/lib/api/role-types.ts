export interface Permission {
  id: number;
  value: string;
  label: string;
}

export interface RoleDetail {
  id: number;
  name: string;
  permissionIds?: number[] | null;
}

export interface RolePayload {
  name: string;
  permissionIds?: number[];
}

export interface RoleUpdateResult {
  role: RoleDetail;
  token?: string;
}

export interface PermissionPayload {
  value: string;
  label: string;
}
