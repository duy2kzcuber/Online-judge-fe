import { API_BASE_URL, API_SUCCESS_CODE } from "./constants";
import { isTokenExpired, parseAuthUserFromToken } from "./jwt";
import { setAccessToken, clearAccessToken, getAccessToken } from "./token";
import { clearStoredUser, setStoredUser } from "./user-storage";
import type { BaseAPIResponse } from "@/lib/api/types";

interface UserMyInfo {
  id?: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
}

export async function persistSessionFromToken(token: string) {
  if (isTokenExpired(token)) {
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  const user = parseAuthUserFromToken(token);

  try {
    const response = await fetch(`${API_BASE_URL}/users/my-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userInfoData: BaseAPIResponse<UserMyInfo> = await response.json();

    if (userInfoData.code === API_SUCCESS_CODE && userInfoData.data) {
      user.avatar = userInfoData.data.avatarUrl ?? userInfoData.data.avatar ?? user.avatar;
    }
    if (userInfoData.code === API_SUCCESS_CODE) {
      user.email = userInfoData.data?.email ?? user.email;
    }
    console.log(user);
  } catch (error) {

    if (process.env.NODE_ENV === "development") {
      console.warn("[persistSessionFromToken] fetch my-info failed:", error);
    }
  }

  setAccessToken(token);
  setStoredUser(user);
  return user;
}

export function clearSession() {
  clearAccessToken();
  clearStoredUser();
}

export function restoreSessionFromStorage() {
  const token = getAccessToken();
  if (!token || isTokenExpired(token)) {
    clearSession();
    return null;
  }

  try {
    return parseAuthUserFromToken(token);
  } catch {
    clearSession();
    return null;
  }
}
