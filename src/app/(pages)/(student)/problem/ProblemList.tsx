"use client"

import { Pagination } from "@/app/components/Pagination/Pagination";

export const ProblemList = () => {
    const problems = [
        {
            id: 1,
            title: "Simple A + B Problem",
            level: "Mid",
            total: 9772,
            acRate: "47.90%",
            tags: ["easy"]
        },
        {
            id: 2,
            title: "Binary Search Adventure",
            level: "Mid",
            total: 519,
            acRate: "8.29%",
            tags: ["search", "contest"]
        },
        {
            id: 3,
            title: "Prime Number Challenge",
            level: "Hard",
            total: 588,
            acRate: "8.67%",
            tags: ["math", "prime"]
        },
        {
            id: 4,
            title: "Dynamic Path Finder",
            level: "Mid",
            total: 635,
            acRate: "19.53%",
            tags: ["dp", "graph"]
        },
        {
            id: 5,
            title: "Triangle Mystery",
            level: "Easy",
            total: 261,
            acRate: "16.86%",
            tags: ["geometry"]
        },
        {
            id: 6,
            title: "String Compression",
            level: "Mid",
            total: 126,
            acRate: "24.60%",
            tags: ["string"]
        },
        {
            id: 7,
            title: "Park Navigation",
            level: "Hard",
            total: 194,
            acRate: "28.35%",
            tags: ["bfs", "search"]
        },
        {
            id: 8,
            title: "Collecting Mushrooms",
            level: "Mid",
            total: 102,
            acRate: "22.55%",
            tags: ["dp"]
        },
        {
            id: 9,
            title: "LC and Prime",
            level: "Hard",
            total: 122,
            acRate: "12.30%",
            tags: ["math"]
        },
        {
            id: 10,
            title: "Princess Rescue",
            level: "Easy",
            total: 101,
            acRate: "15.84%",
            tags: ["greedy"]
        },
    ];
    const pagination = {
        page: 2,
        pageSize: 10,
        totalPages: 36,
        totalItems: 360
    }
    return (
        <>
            <table className="w-full mt-4 border-collapse bg-white text-sm">
                <thead>
                    <tr className="border-b text-left text-gray-600">
                        <th className="py-4 px-5 font-semibold">#</th>
                        <th className="py-4 px-5 font-semibold">Tên bài tập</th>
                        <th className="py-4 px-5 font-semibold text-center">Độ khó</th>
                        <th className="py-4 px-5 font-semibold text-center">Tổng số lượt làm bài</th>
                        <th className="py-4 px-5 font-semibold text-center">Tỉ lệ AC</th>
                        <th className="py-4 px-5 font-semibold">Danh mục</th>
                    </tr>
                </thead>

                <tbody>
                    {problems.map((problem) => (
                        <tr
                            key={problem.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                        >
                            <td className="py-5 px-5 text-gray-700">{problem.id}</td>

                            <td className="py-5 px-5">
                                <a className="text-gray-800 hover:text-oj-orange  cursor-pointer font-medium">
                                    {problem.title}
                                </a>
                            </td>

                            <td className="py-5 px-5 text-center">
                                <span className="bg-oj-orange text-white text-xs px-3 py-1 rounded-md font-medium">
                                    {problem.level}
                                </span>
                            </td>

                            <td className="py-5 px-5 text-center text-gray-700">
                                {problem.total}
                            </td>

                            <td className="py-5 px-5 text-center text-gray-700">
                                {problem.acRate}
                            </td>

                            <td className="py-5 px-5">
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination pagination={pagination}/>
        </>


    )
}