"use client";

import Link from "next/link";
import { useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function AdminCreateContestPage() {
  const [ruleType, setRuleType] = useState<"ICPC" | "NORMAL_TEST">("NORMAL_TEST");
  const [realTimeRank, setRealTimeRank] = useState(true);
  const [visible, setVisible] = useState(true);
  const [ipRanges, setIpRanges] = useState<string[]>([""]);

  const addIpRange = () => setIpRanges((prev) => [...prev, ""]);
  const removeIpRange = (index: number) => {
    setIpRanges((prev) =>
      prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)
    );
  };
  const updateIpRange = (index: number, value: string) => {
    setIpRanges((prev) =>
      prev.map((item, i) => (i === index ? value : item))
    );
  };

  return (
    <section className="bg-oj-white rounded-[8px] border border-[#E5E7EB] px-[16px] py-[14px]">
      <div className="flex flex-wrap items-center justify-between gap-[10px] mb-[16px]">
        <h2 className="text-[18px] font-[600]">Tạo kì thi</h2>
        <Link
          href="/admin/contest"
          className="border border-[#D1D5DB] rounded-[8px] px-[12px] py-[8px] text-[14px] hover:border-oj-orange hover:text-oj-orange"
        >
          Quay lại danh sách kì thi
        </Link>
      </div>

      <form className="grid gap-y-[16px] max-w-[960px]">
        <div>
          <label className="block mb-[6px] text-[14px] font-[500]">
            Tiêu đề kì thi <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            required
            placeholder="Nhập tiêu đề kì thi"
            className="w-full border border-[#D1D5DB] rounded-[8px] h-[42px] px-[12px] text-[14px]"
          />
        </div>

        <div>
          <label className="block mb-[6px] text-[14px] font-[500]">
            Mô tả <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={6}
            placeholder="Mô tả chi tiết kì thi (có thể dùng HTML sau khi tích hợp editor)"
            className="w-full border border-[#D1D5DB] rounded-[8px] px-[12px] py-[10px] text-[14px] resize-y min-h-[120px]"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-[14px]">
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              name="start_time"
              type="datetime-local"
              required
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[42px] px-[12px] text-[14px]"
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              name="end_time"
              type="datetime-local"
              required
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[42px] px-[12px] text-[14px]"
            />
          </div>
          <div>
            <label className="block mb-[6px] text-[14px] font-[500]">
              Mật khẩu tham gia
            </label>
            <input
              name="password"
              type="password"
              placeholder="Để trống nếu kì thi công khai"
              autoComplete="new-password"
              className="w-full border border-[#D1D5DB] rounded-[8px] h-[42px] px-[12px] text-[14px]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-[14px] items-start">
          <fieldset className="border-0 p-0 m-0 min-w-0">
            <legend className="block mb-[6px] text-[14px] font-[500]">
              Luật chấm
            </legend>
            <div className="flex flex-wrap gap-x-[16px] gap-y-[8px]">
              <label className="inline-flex items-center gap-[8px] cursor-pointer text-[14px]">
                <input
                  type="radio"
                  name="rule_type"
                  checked={ruleType === "ICPC"}
                  onChange={() => setRuleType("ICPC")}
                  className="accent-oj-orange"
                />
                ICPC
              </label>
              <label className="inline-flex items-center gap-[8px] cursor-pointer text-[14px]">
                <input
                  type="radio"
                  name="rule_type"
                  checked={ruleType === "NORMAL_TEST"}
                  onChange={() => setRuleType("NORMAL_TEST")}
                  className="accent-oj-orange"
                />
                Kì thi kiểm tra thông thường
              </label>
            </div>
          </fieldset>

          <label className="flex items-center justify-between gap-[12px] rounded-[8px] border border-[#E5E7EB] px-[12px] py-[10px] cursor-pointer">
            <span className="text-[14px] font-[500]">Bảng xếp hạng thời gian thực</span>
            <input
              type="checkbox"
              checked={realTimeRank}
              onChange={(e) => setRealTimeRank(e.target.checked)}
              className="h-[18px] w-[18px] accent-oj-orange shrink-0"
            />
          </label>

          <label className="flex items-center justify-between gap-[12px] rounded-[8px] border border-[#E5E7EB] px-[12px] py-[10px] cursor-pointer">
            <span className="text-[14px] font-[500]">Hiển thị kì thi</span>
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="h-[18px] w-[18px] accent-oj-orange shrink-0"
            />
          </label>
        </div>

        <div>
          <label className="block mb-[8px] text-[14px] font-[500]">
            Dải IP được phép (CIDR)
          </label>
          <p className="text-[13px] text-[#6B7280] mb-[10px]">
            Để trống nếu không giới hạn. Ví dụ:{" "}
            <code className="bg-[#F3F4F6] px-[4px] rounded">192.168.1.0/24</code>
          </p>
          <div className="grid gap-y-[10px]">
            {ipRanges.map((value, index) => (
              <div
                key={index}
                className="flex flex-wrap items-center gap-[10px]"
              >
                <input
                  value={value}
                  onChange={(e) => updateIpRange(index, e.target.value)}
                  placeholder="192.168.0.0/16"
                  className="flex-1 min-w-[200px] border border-[#D1D5DB] rounded-[8px] h-[42px] px-[12px] text-[14px]"
                />
                <button
                  type="button"
                  onClick={addIpRange}
                  className="h-[42px] w-[42px] shrink-0 border border-[#D1D5DB] rounded-[8px] flex items-center justify-center hover:border-oj-orange hover:text-oj-orange"
                  aria-label="Thêm dải IP"
                  title="Thêm dải IP"
                >
                  <FaPlus className="text-[14px]" />
                </button>
                <button
                  type="button"
                  onClick={() => removeIpRange(index)}
                  className="h-[42px] w-[42px] shrink-0 border border-[#D1D5DB] rounded-[8px] flex items-center justify-center hover:border-red-400 hover:text-red-500"
                  aria-label="Xóa dải IP"
                  title="Xóa dải IP"
                >
                  <FaTrash className="text-[14px]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-[8px]">
          <button
            type="button"
            className="bg-oj-orange text-oj-white rounded-[8px] px-[18px] py-[10px] text-[15px] font-[500] hover:bg-[#F5965B]"
          >
            Lưu kì thi
          </button>
        </div>
      </form>
    </section>
  );
}
