import { Button } from "@/app/components/button/Button";

export default function Problem() {
  return (
    <>
      <div className="container pt-[100px]">
        {/* Danh sách bài tập */}
        <div className="">
          <h1>Danh sách bài tập</h1>
          <div>
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
            <input placeholder="Nhập từ khóa tìm kiếm"/>
            <Button displayContent="tải lại" />
          </div>
        </div>
        {/* Danh sách danh mục bài tập */}
      </div>
    </>
  )
}