"use client";

import { fetchContestById, updateContest } from "@/lib/api/contest-api";
import type { ContestCreatePayload } from "@/lib/api/contest-types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ContestProblemPicker } from "../../ContestProblemPicker";
import {
  contestInputClass,
  toDatetimeLocalValue,
  toIsoDateTime,
  type SelectedContestProblem,
} from "../../contest-form";

const defaultForm = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  password: "",
  visible: true,
};

type AdminEditContestFormProps = {
  contestId: number;
};

export function AdminEditContestForm({ contestId }: AdminEditContestFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState<SelectedContestProblem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const contest = await fetchContestById(contestId);
        if (cancelled) return;

        setForm({
          title: contest.title,
          description: contest.description,
          startTime: toDatetimeLocalValue(contest.startTime),
          endTime: toDatetimeLocalValue(contest.endTime),
          password: "",
          visible: contest.visible,
        });
        setPasswordProtected(contest.passwordProtected);
        setSelectedProblems(
          [...(contest.problems ?? [])]
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map((item) => ({
              problemId: item.problemId,
              title: item.problemTitle ?? item.problemId,
            })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Không thể tải thông tin kì thi",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [contestId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Vui lòng nhập tiêu đề kì thi");
      return;
    }
    if (!form.description.trim()) {
      setError("Vui lòng nhập mô tả kì thi");
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc");
      return;
    }

    const startIso = toIsoDateTime(form.startTime);
    const endIso = toIsoDateTime(form.endTime);
    if (new Date(endIso) <= new Date(startIso)) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu");
      return;
    }

    const payload: ContestCreatePayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      startTime: startIso,
      endTime: endIso,
      visible: form.visible,
      problems: selectedProblems.map((item, index) => ({
        problemId: item.problemId,
        sortIndex: index,
      })),
    };
    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    setSubmitting(true);
    try {
      await updateContest(contestId, payload);
      router.push("/admin/contest");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể cập nhật kì thi",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
        Đang tải thông tin kì thi...
      </section>
    );
  }

  if (error && !form.title) {
    return (
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px]">
        <p className="text-center text-[14px] text-red-600 mb-[12px]" role="alert">
          {error}
        </p>
        <div className="text-center">
          <Link
            href="/admin/contest"
            className="text-oj-orange hover:underline text-[14px]"
          >
            Quay lại danh sách kì thi
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[16px]">
        <div>
          <h2 className="text-[18px] font-[600]">Sửa kì thi #{contestId}</h2>
          <p className="text-[13px] text-[#6B7280] mt-[4px]">
            Cập nhật thông tin và danh sách bài tập
          </p>
        </div>
        <Link
          href="/admin/contest"
          className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
        >
          Quay lại danh sách kì thi
        </Link>
      </div>

      {error && (
        <p className="mb-[14px] text-[14px] text-red-600" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-y-[16px] max-w-[960px]">
        <div>
          <label className="block mb-[6px] text-[14px] font-[500]">
            Tiêu đề kì thi <span className="text-red-500">*</span>
          </label>
          <input
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            required
            maxLength={255}
            className={`${contestInputClass} h-[42px]`}
          />
        </div>

        <div>
          <label className="block mb-[6px] text-[14px] font-[500]">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            required
            rows={6}
            className={`${contestInputClass} min-h-[120px] resize-y`}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-[14px]">
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, startTime: e.target.value }))
              }
              required
              className={`${contestInputClass} h-[42px]`}
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, endTime: e.target.value }))
              }
              required
              className={`${contestInputClass} h-[42px]`}
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Mật khẩu tham gia
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              placeholder={
                passwordProtected
                  ? "Để trống nếu không đổi mật khẩu"
                  : "Nhập mật khẩu mới (tùy chọn)"
              }
              autoComplete="new-password"
              className={`${contestInputClass} h-[42px]`}
            />
            {passwordProtected && (
              <p className="mt-[6px] text-[12px] text-[#6B7280]">
                Kì thi hiện đang có mật khẩu.
              </p>
            )}
          </div>
        </div>

        <label className="flex items-center justify-between gap-[12px] max-w-[320px] rounded-[8px] border border-[#E5E7EB] px-[12px] py-[10px] cursor-pointer">
          <span className="text-[14px] font-[500]">Hiển thị kì thi</span>
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, visible: e.target.checked }))
            }
            className="h-[18px] w-[18px] accent-oj-orange shrink-0"
          />
        </label>

        <ContestProblemPicker
          selectedProblems={selectedProblems}
          onChange={setSelectedProblems}
        />

        <div className="flex justify-end pt-[8px]">
          <button
            type="submit"
            disabled={submitting}
            className="bg-oj-orange text-oj-white rounded-[8px] px-[18px] py-[10px] text-[15px] font-[500] hover:bg-[#F5965B] disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : "Cập nhật kì thi"}
          </button>
        </div>
      </form>
    </section>
  );
}
