import { HeaderAccount } from "./HeaderAccount"
import { HeaderMenu } from "./HeaderMenu"

export const Header = () => {

  return (
    <>
      <div className="flex gap-[20px] px-[30px] md:px-[15px] bg-[#FDFDFD] shadow-[0_4px_20px_rgba(0,0,0,0.06)] fixed w-full mb-[100px]">
        <div className="text-center justify-center items-center flex text-[20px]">
          UTTOJ
        </div>
        <HeaderMenu />
        <HeaderAccount/>
      </div>
    </>

  )
}