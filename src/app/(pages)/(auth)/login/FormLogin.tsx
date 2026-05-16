"use client";

import { useAuth } from "@/contexts/AuthContext";
import JustValidate from "just-validate";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const FormLogin = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const validator = new JustValidate("#loginForm");

    validator
      .addField("#username", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập tên đăng nhập của bạn!",
        },
        {
          validator: (value: string) => value.length >= 5,
          errorMessage: "Tên đăng nhập phải có ít nhất 5 ký tự!",
        },
      ])
      .addField("#password", [
        {
          rule: "required",
          errorMessage: "Vui lòng nhập mật khẩu!",
        },
        {
          validator: (value: string) => value.length >= 8,
          errorMessage: "Mật khẩu phải chứa ít nhất 8 ký tự!",
        },
      ])
      .onSuccess(async (event: SubmitEvent) => {
        event.preventDefault();

        if (isSubmittingRef.current) return;

        const form = event.target as HTMLFormElement;
        const username = (form.elements.namedItem("username") as HTMLInputElement)
          .value;
        const password = (form.elements.namedItem("password") as HTMLInputElement)
          .value;

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setErrorMessage(null);

        try {
          await login({ username, password });
          router.push("/");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Đăng nhập thất bại. Vui lòng thử lại.";
          setErrorMessage(message);
        } finally {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      });

    return () => {
      validator.destroy();
    };
  }, [login, router]);

  return (
    <form
      id="loginForm"
      className="grid grid-cols-1 gap-y-[15px]"
      onSubmit={(e) => e.preventDefault()}
    >
      {errorMessage && (
        <p
          role="alert"
          className="rounded-[4px] border border-red-200 bg-red-50 px-[12px] py-[10px] text-[14px] text-red-600"
        >
          {errorMessage}
        </p>
      )}

      <div>
        <label htmlFor="username" className="block font-[500] text-[14px] text-black mb-[5px]">
          Tên đăng nhập *
        </label>
        <input
          type="text"
          name="username"
          id="username"
          autoComplete="username"
          disabled={isSubmitting}
          className="w-[100%] h-[46px] border border-[#DEDEDE] rounded-[4px] py-[14px] px-[20px] font-[500] text-[14px] text-black disabled:opacity-60"
        />
      </div>

      <div>
        <label htmlFor="password" className="block font-[500] text-[14px] text-black mb-[5px]">
          Mật khẩu *
        </label>
        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          className="w-[100%] h-[46px] border border-[#DEDEDE] rounded-[4px] py-[14px] px-[20px] font-[500] text-[14px] text-black disabled:opacity-60"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-oj-orange rounded-[4px] w-[100%] h-[48px] px-[20px] font-[500] text-[16px] text-white hover:bg-[#ED8C51] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </form>
  );
};
