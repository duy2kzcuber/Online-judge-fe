import { Pagination } from "@/app/components/Pagination/Pagination"
import Link from "next/link"

export default function Home() {
  const announcementsData = [
    {
      "title": "Tùng mid vcl",
      "link": "#",
      "createdDate": "1776094043", //dạng UNIX
      "modifiedDate": "1776094043",
      "userFullName": "Root"
    },
    {
      "title": "XIn",
      "link": "#",
      "createdDate": "1776094043", //dạng UNIX
      "modifiedDate": "1776094043",
      "userFullName": "Root"
    },
    {
      "title": "各位超级管理员请勿随便修改",
      "link": "#",
      "createdDate": "1776094043", //dạng UNIX
      "modifiedDate": "1776094043",
      "userFullName": "Root"
    },
    {
      "title": "各位超级管理员请勿随便修改本站配置各位超级管理员请勿随便修改本站配置",
      "link": "#",
      "createdDate": "1776094043", //dạng UNIX
      "modifiedDate": "1776094043",
      "userFullName": "Root"
    }
  ]

  const pagination = {
    page: 2,
    pageSize: 10,
    totalPages: 36,
    totalItems: 360
  }


  return (
    <>
      <div className="container pt-[120px]">
        <div className="bg-oj-white px-[16px] py-[14px] rounded-[5px]">
          {/* Box header */}
          <div className="flex justify-between">
            <div className="text-[18px] text-center items-center justify-center">Thông báo</div>
            <button className="bg-oj-orange px-[15px] py-[6px] text-oj-white rounded-[5px] hover:bg-[#f5965b]">Tải lại</button>
          </div>
          {/* Box content: display list of posts */}
          <div className="pt-[15px]">
            {
              announcementsData && announcementsData.map((announcement, index) => (
                <div className="flex justify-between my-[10px]" key={index}>
                  <Link
                    className="underline text-[19px] truncate w-[60%] hover:text-oj-orange"
                    href={announcement.link}>
                    {announcement.title}
                  </Link>
                  <div className="w-[30%] flex justify-between">
                    <div className="">
                      {announcement.createdDate}
                    </div>
                    <div className="">
                      Bởi {announcement.userFullName}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        {/* Paginition */}
        <Pagination pagination={pagination}/>
      </div>
    </>
  )
}