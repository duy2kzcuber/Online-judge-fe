import type {
  Announcement,
  AnnouncementPage,
  AnnouncementRequestPayload,
} from "@/lib/api/announcement-types";
import type { BaseAPIResponse } from "@/lib/api/types";
import { apiFetch } from "@/lib/api/client";
import { API_BASE_URL, API_SUCCESS_CODE } from "@/lib/auth/constants";
import { getAccessToken } from "@/lib/auth/token";

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildPageQuery(page: number, size: number): string {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  qs.set("sort", "createTime,desc");
  return qs.toString();
}

export async function fetchAnnouncements(
  page = 0,
  size = 15,
): Promise<AnnouncementPage> {
  const response = await fetch(
    `${API_BASE_URL}/announcements?${buildPageQuery(page, size)}`,
    {
      headers: authHeaders(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Không thể tải danh sách thông báo");
  }

  return response.json() as Promise<AnnouncementPage>;
}

export async function fetchPublicAnnouncements(
  page = 0,
  size = 10,
): Promise<AnnouncementPage> {
  const response = await fetch(
    `${API_BASE_URL}/announcements/public?${buildPageQuery(page, size)}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error("Không thể tải thông báo");
  }

  return response.json() as Promise<AnnouncementPage>;
}

export async function fetchAnnouncementById(
  id: number,
): Promise<Announcement> {
  const body = await apiFetch<Announcement>(`/announcements/${id}`);
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không tìm thấy thông báo");
  }
  return body.data;
}

export async function createAnnouncement(
  payload: AnnouncementRequestPayload,
): Promise<Announcement> {
  const body = await apiFetch<Announcement>("/announcements", {
    method: "POST",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể tạo thông báo");
  }
  return body.data;
}

export async function updateAnnouncement(
  id: number,
  payload: AnnouncementRequestPayload,
): Promise<Announcement> {
  const body = await apiFetch<Announcement>(`/announcements/${id}`, {
    method: "PUT",
    body: payload,
  });
  if (body.code !== API_SUCCESS_CODE || !body.data) {
    throw new Error(body.message ?? "Không thể cập nhật thông báo");
  }
  return body.data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  const body = await apiFetch<unknown>(`/announcements/${id}`, {
    method: "DELETE",
  });
  if (body.code !== API_SUCCESS_CODE) {
    throw new Error(body.message ?? "Không thể xóa thông báo");
  }
}
