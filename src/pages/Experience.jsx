import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import CaseLibrary from "../components/experience/CaseLibrary";
import TechForum from "../components/experience/TechForum";

export default function Experience() {
    const location = useLocation();
    useNavigate();
// 解析tab参数
    const tab = (() => {
        const m = location.search.match(/tab=(\w+)/);
        return m ? m[1] : "cases";
    })();

    // 案例库和论坛帖子状态
    const [cases, setCases] = useState([]);
    const [forumPosts, setForumPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 论坛筛选参数
    const [forumPage] = useState(1);
    const [forumSize] = useState(20);
    const [forumCategory, setForumCategory] = useState("全部");
    const [forumKeyword, setForumKeyword] = useState("");

    useEffect(() => {
        if (tab === "forum") {
            loadForumPosts();
        }
        // eslint-disable-next-line
    }, [tab, forumPage, forumSize, forumCategory, forumKeyword]);

    const loadForumPosts = async () => {
        setIsLoading(true);
        const params = {
            page: forumPage,
            size: forumSize,
        };
        if (forumCategory && forumCategory !== "全部") params.category = forumCategory;
        if (forumKeyword) params.keyword = forumKeyword;
        try {
            const resp = await fetch(`/api/forum/posts/page`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(params),
            });
            const result = await resp.json();
            if (result.code === 200 && result.data) {
                setForumPosts(result.data.content || []);
            } else {
                setForumPosts([]);
            }
        } catch (error) {
            console.error("加载论坛帖子失败:", error);
            setForumPosts([]);
        }
        setIsLoading(false);
    };

    // 案例库相关逻辑保持不变
    const [casePage] = useState(1);
    const [caseSize] = useState(20);
    const [caseSort] = useState("-created_date");
    const [faultType] = useState("");
    const [timeRange] = useState("");
    const [likesMin] = useState("");
    const [keyword] = useState("");

    useEffect(() => {
        if (tab === "cases") {
            loadCases();
        }
        // eslint-disable-next-line
    }, [tab, casePage, caseSize, caseSort, faultType, timeRange, likesMin, keyword]);

    const loadCases = async () => {
        setIsLoading(true);
        const params = {
            page: casePage,
            size: caseSize,
            sort: caseSort,
        };
        try {
            const resp = await fetch(`/api/cases/page`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(params),
            });
            const result = await resp.json();
            if (result.code === 200 && result.data) {
                setCases(result.data.content || []);
            } else {
                setCases([]);
            }
        } catch (error) {
            console.error("加载案例数据失败:", error);
            setCases([]);
        }
        setIsLoading(false);
    };

    // 页面内容
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        经验分享与案例学习平台
                    </h1>
                    <p className="text-gray-600 text-lg">分享经验，学习成长，共建技术社区</p>
                </div>

                {/* 不再显示Tabs，仅根据tab参数渲染内容 */}
                <div className="mt-6">
                    {tab === "cases" && (
                        <CaseLibrary
                            cases={cases}
                            isLoading={isLoading}
                        />
                    )}
                    {tab === "forum" && (
                        <TechForum
                            posts={forumPosts}
                            isLoading={isLoading}
                            onCategoryChange={setForumCategory}
                            category={forumCategory}
                            onKeywordChange={setForumKeyword}
                            keyword={forumKeyword}
                            onRefresh={loadForumPosts}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}