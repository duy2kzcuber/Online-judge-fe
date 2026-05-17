import type { SpringPage } from "@/lib/api/problem-types";

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: string;
  username: string;
  fullName?: string | null;
  email?: string | null;
  bio?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  roles?: Role[] | null;
  createdAt?: string | null;
}

export interface UserCreatePayload {
  username: string;
  password: string;
  email: string;
  fullName: string;
  roleIds?: number[];
}

export interface UserUpdatePayload {
  fullName?: string;
  email?: string;
  password?: string;
  bio?: string;
  roleIds?: number[];
}

export type UserPage = SpringPage<User>;
