"use client";

import DOMPurify from "isomorphic-dompurify";

interface HtmlContentProps {
  html: string;
  className?: string;
}

export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  return (
    <motionlessField>
      <div
        className={`problem-html text-[14px] text-gray-800 leading-relaxed
          [&_p]:mb-[8px] [&_p:last-child]:mb-0
          [&_ul]:mb-[8px] [&_ul]:list-disc [&_ul]:pl-[20px]
          [&_ol]:mb-[8px] [&_ol]:list-decimal [&_ol]:pl-[20px]
          [&_li]:mb-[4px]
          [&_strong]:font-[600]
          [&_a]:text-oj-orange [&_a]:underline
          [&_pre]:bg-oj-gray [&_pre]:rounded-[6px] [&_pre]:p-[12px] [&_pre]:overflow-x-auto
          [&_code]:font-mono [&_code]:text-[13px]
          ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    </motionlessField>
  );
}
