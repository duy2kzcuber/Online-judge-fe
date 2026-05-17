import type { SpringPage } from "@/lib/api/problem-types";

export interface AnnouncementAuthor {
  username: string;
  fullName?: string | null;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  visible: boolean;
  createTime?: string;
  lastUpdateTime?: string;
  createdBy?: AnnouncementAuthor | null;
}

export interface AnnouncementRequestPayload {
  title: string;
  content: string;
  visible: boolean;
}

export type AnnouncementPage = SpringPage<Announcement>;
