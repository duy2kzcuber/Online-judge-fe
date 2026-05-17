import { Suspense } from "react";
import { AnnouncementsPanel } from "./AnnouncementsPanel";

export default function Home() {
  return (
    <div className="container pt-[120px]">
      <Suspense
        fallback={
          <div className="bg-oj-white px-[16px] py-[40px] rounded-[5px] text-center text-[#6B7280]">
            Đang tải thông báo...
          </div>
        }
      >
        <AnnouncementsPanel />
      </Suspense>
    </div>
  );
}
