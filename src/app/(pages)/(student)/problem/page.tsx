import { Button } from "@/app/components/button/Button";
import { ProblemList } from "./ProblemList";

export default function Problem() {
  return (
    <> 
      <div className="container pt-[100px] ">
        <div className="bg-oj-white px-[20px] py-[10px] rounded-[7px]">
          {/* Danh sách bài tập */}
          <div className="flex text-center justify-between ">
            <h1 className="uppercase flex text-center items-center">Danh sách bài tập</h1>
            <div className="flex text-center gap-x-[20px]">
              <select name="category" id="category">
                <option defaultChecked>Danh mục</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
              </select>
              <select name="level" id="level">
                <option defaultChecked>Độ khó</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
              </select>
              <input className="rounded-[10px] border-[2px] solid border-[#d9dff2] h-full placeholder:text-center placeholder:item-center placeholder:justify-center hover:border-oj-orange" placeholder="Nhập từ khóa tìm kiếm" />
              <Button displayContent="Tải lại" />
            </div>
          </div>
          {/* Danh sách danh mục bài tập */}
          <ProblemList />
        </div>
      </div>
    </>
  )
}