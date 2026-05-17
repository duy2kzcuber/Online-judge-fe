"use client";

import {
  createProblem,
  fetchCategories,
  fetchProblemById,
  updateProblem,
} from "@/lib/api/problem-api";
import type { Category, ProblemRequestPayload } from "@/lib/api/problem-types";
import { DIFFICULTY_OPTIONS } from "@/lib/problem/difficulty";
import { DEFAULT_LANGUAGES } from "@/lib/submission/language";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

const fieldClass =
  "w-full border border-[#D1D5DB] rounded-[8px] px-[10px] text-[14px] focus:border-oj-orange";
const inputClass = `${fieldClass} h-[40px]`;
const textareaClass = `${fieldClass} py-[8px]`;

const defaultForm: ProblemRequestPayload = {
  title: "",
  description: "",
  inputDescription: "",
  outputDescription: "",
  sampleTestcase: "",
  isPublic: true,
  isShareSubmission: false,
  timeLimit: 1000,
  memoryLimit: 256,
  allowedLanguage: [...DEFAULT_LANGUAGES],
  categories: [],
  difficulty: 1,
};

function AdminProblemFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);

  const [form, setForm] = useState<ProblemRequestPayload>(defaultForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testCaseFile, setTestCaseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!editId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProblemById(editId)
      .then((problem) => {
        if (cancelled) return;
        setForm({
          title: problem.title ?? "",
          description: problem.description ?? "",
          inputDescription: problem.inputDescription ?? "",
          outputDescription: problem.outputDescription ?? "",
          sampleTestcase: problem.sampleTestcase ?? "",
          isPublic: problem.isPublic ?? true,
          isShareSubmission: problem.isShareSubmission ?? false,
          timeLimit: problem.timeLimit ?? 1000,
          memoryLimit: problem.memoryLimit ?? 256,
          allowedLanguage:
            problem.allowedLanguage?.length
              ? problem.allowedLanguage
              : [...DEFAULT_LANGUAGES],
          categories: problem.categories ?? [],
          difficulty: problem.difficulty ?? 1,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Không thể tải bài tập",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editId]);

  const toggleCategory = (categoryId: string) => {
    setForm((prev) => {
      const current = prev.categories ?? [];
      const exists = current.includes(categoryId);
      return {
        ...prev,
        categories: exists
          ? current.filter((id) => id !== categoryId)
          : [...current, categoryId],
      };
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && editId) {
        await updateProblem(editId, form, testCaseFile);
      } else {
        await createProblem(form, testCaseFile);
      }
      router.push("/admin/problems");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu bài tập");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
        Đang tải bài tập...
      </section>
    );
  }

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex items-center justify-between mb-[14px]">
        <h2 className="text-[18px] font-[600]">
          {isEdit ? "Chỉnh sửa bài tập" : "Tạo bài tập"}
        </h2>
        <Link
          href="/admin/problems"
          className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
        >
          Quay lại danh sách
        </Link>
      </div>

      {error && (
        <p className="mb-[12px] text-[14px] text-red-600" role="alert">
          {error}
        </p>
      )}

      <form className="grid gap-y-[14px]" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-[6px] text-[14px]">Tiêu đề *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Mô tả bài tập *</label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className={textareaClass}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-[12px]">
          <div>
            <label className="block mb-[6px] text-[14px]">Mô tả đầu vào *</label>
            <textarea
              required
              rows={4}
              value={form.inputDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, inputDescription: e.target.value }))
              }
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">Mô tả đầu ra *</label>
            <textarea
              required
              rows={4}
              value={form.outputDescription}
              onChange={(e) =>
                setForm((p) => ({ ...p, outputDescription: e.target.value }))
              }
              className={textareaClass}
            />
          </div>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Ví dụ mẫu</label>
          <textarea
            rows={4}
            value={form.sampleTestcase ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, sampleTestcase: e.target.value }))
            }
            className={textareaClass}
            placeholder="Input / Output mẫu"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-[12px]">
          <div>
            <label className="block mb-[6px] text-[14px]">Time Limit (ms) *</label>
            <input
              type="number"
              required
              min={1}
              max={600000}
              value={form.timeLimit}
              onChange={(e) =>
                setForm((p) => ({ ...p, timeLimit: Number(e.target.value) }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">Memory Limit (MB) *</label>
            <input
              type="number"
              required
              min={1}
              max={1024}
              value={form.memoryLimit}
              onChange={(e) =>
                setForm((p) => ({ ...p, memoryLimit: Number(e.target.value) }))
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px]">Độ khó</label>
            <select
              value={form.difficulty ?? 1}
              onChange={(e) =>
                setForm((p) => ({ ...p, difficulty: Number(e.target.value) }))
              }
              className={inputClass}
            >
              {DIFFICULTY_OPTIONS.filter((o) => o.value > 0).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">Danh mục</label>
          <div className="flex flex-wrap gap-[8px]">
            {categories.length === 0 ? (
              <span className="text-[13px] text-[#9CA3AF]">Chưa có danh mục</span>
            ) : (
              categories.map((cat) => {
                const checked = (form.categories ?? []).includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`cursor-pointer text-[13px] px-[10px] py-[6px] rounded-[6px] border ${
                      checked
                        ? "border-oj-orange bg-[#FFF1E9] text-oj-orange"
                        : "border-[#D1D5DB] text-[#374151]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleCategory(cat.id)}
                    />
                    {cat.title}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-[20px]">
          <label className="flex items-center gap-[8px] text-[14px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) =>
                setForm((p) => ({ ...p, isPublic: e.target.checked }))
              }
            />
            Công khai
          </label>
          <label className="flex items-center gap-[8px] text-[14px] cursor-pointer">
            <input
              type="checkbox"
              checked={form.isShareSubmission}
              onChange={(e) =>
                setForm((p) => ({ ...p, isShareSubmission: e.target.checked }))
              }
            />
            Cho phép xem bài nộp của người khác
          </label>
          <label className="flex items-center gap-[8px] text-[14px] cursor-pointer">
            <input
              type="checkbox"
              checked={(form.allowedLanguage ?? []).includes("cpp")}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  allowedLanguage: e.target.checked ? ["cpp"] : [],
                }))
              }
            />
            C++
          </label>
        </div>

        <div>
          <label className="block mb-[6px] text-[14px]">
            Test case (zip){isEdit ? " — để trống nếu không đổi" : " *"}
          </label>
          <input
            type="file"
            accept=".zip"
            required={!isEdit}
            onChange={(e) => setTestCaseFile(e.target.files?.[0] ?? null)}
            className="block w-full text-[14px]"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-oj-orange text-oj-white rounded-[8px] px-[14px] py-[9px] hover:bg-[#F5965B] disabled:opacity-50"
          >
            {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo bài tập"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function AdminProblemForm() {
  return (
    <Suspense
      fallback={
        <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[40px] text-center text-[#6B7280]">
          Đang tải...
        </section>
      }
    >
      <AdminProblemFormContent />
    </Suspense>
  );
}
