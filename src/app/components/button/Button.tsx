"use client"
import { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  displayContent?: React.ReactNode;
  onButtonClick?: () => void;
}
export const Button = ({ className,displayContent,onButtonClick, ...props }: ButtonProps) => {
  return (
    <button
      onClick={() => onButtonClick?.()}
      {...props}
      className={`bg-oj-orange px-[15px] py-[6px] text-oj-white rounded-[5px] hover:bg-[#f5965b] ${className}`}
    >
      {displayContent}
    </button>
  )
}