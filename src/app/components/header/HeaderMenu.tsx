"use client"
import { HiOutlineViewGrid } from "react-icons/hi";
import { IoMdHome } from "react-icons/io";
import { FaInfoCircle, FaTrophy } from "react-icons/fa";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbGridDots } from "react-icons/tb";


export const HeaderMenu = () => {
  const navLinks = [
    { id: 1, title: "Trang chủ ", href: "/", icon: <IoMdHome /> },
    { id: 2, title: "Bài tập", href: "/bai-tap", icon: <TbGridDots /> },
    { id: 3, title: "Kì thi", href: "/ki-thi", icon: <FaTrophy /> },
    { id: 4, title: "Giới thiệu", href: "/gioi-thieu", icon: <FaInfoCircle /> },
  ];

  const pathName = usePathname();
  console.log(pathName);

  return (
    <>
      <ul className="flex flex-wrap flex-1 justify-center">
        {navLinks.map((link) => (
          <li key={link.id} className={`hover:border-b-[2px] hover:border-b-oj-orange hover:text-oj-orange${pathName == link.href ? `text-oj-orange border-b-[2px] border-b-oj-orange` : ''}`}>
            <Link
              href={link.href}
              className={`flex items-center gap-[5px] px-[20px] py-[20px] md:gap-[10px] text-[12px] md:text-[16px]`}>
              {link.icon}
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}