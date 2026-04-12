import { HeaderAccount } from "./HeaderAccount"
import { HeaderMenu } from "./HeaderMenu"

export const Header = () => {

  return (
    <>
      <header className="bg-[#FDFDFD] shadow-[0_4px_20px_rgba(0,0,0,0.06)] fixed w-full  ">
        <div className="container md:gap-[20px] gap-[10px] flex flex-1">
          <div className="text-center justify-center items-center flex text-[12px] md:text-[20px]">
            UTTOJ
          </div>
          <HeaderMenu />
          <HeaderAccount />
        </div>
      </header>
    </>

  )
}