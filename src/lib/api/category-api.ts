import type { Category } from "@/lib/api/problem-types";
import type { BaseAPIResponse } from "@/lib/api/types";
import { apiFetch } from "@/lib/api/client";
import { API_SUCCESS_CODE } from "@/lib/auth/constants";

export interface CategoryRequestPayload {
  title: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const body = await apiFetch<Category[]>("/category");
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tải danh mục");
  }
  return body.data;
}

export async function fetchCategoryById(categoryId: string): Promise<Category> {
  const body = await apiFetch<Category>(`/category/${categoryId}`);
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy danh mục");
  }
  return body.data;
}

export async function createCategory(
  payload: CategoryRequestPayload,
): Promise<Category> {
  const body = await apiFetch<Category>("/category", {
    method: "POST",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo danh mục");
  }
  return body.data;
}

export async function updateCategory(
  categoryId: string,
  payload: CategoryRequestPayload,
): Promise<Category> {
  const body = await apiFetch<Category>(`/category/${categoryId}`, {
    method: "PUT",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể cập nhật danh mục");
  }
  return body.data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const body = await apiFetch<unknown>(`/category/${categoryId}`, {
    method: "DELETE",
  });
  if (body.code !== API_SUCCESS_CODE) {
    throw new Error(body.message ?? "Không thể xóa danh mục");
  }
}
