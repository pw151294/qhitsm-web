import {useState, useEffect} from "react";
import QuickFeedback from "../components/feedback/QuickFeedback";
import FeedbackStats from "../components/feedback/FeedbackStats";
import FeedbackManagement from "../components/feedback/FeedbackManagement";
import { useLocation, useNavigate } from "react-router-dom";

export default function Feedback() {
    const location = useLocation();
    useNavigate();
// 解析tab参数
    const tab = (() => {
        const m = location.search.match(/tab=(\w+)/);
        return m ? m[1] : "quick";
    })();

    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedbackList, setFeedbackList] = useState([]);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    const [page] = useState(1);
    const [size] = useState(20);
    const [, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        type: "all",
        status: "all",
        priority: "",
        responsible_team: "",
        keyword: ""
    });

    // 只要filters变化且在管理tab下就刷新
    useEffect(() => {
        if (tab === "management") {
            loadFeedbacks();
        }
        // eslint-disable-next-line
    }, [filters, tab]);

    // 页面首次加载
    useEffect(() => {
        loadFeedbacks();
        // eslint-disable-next-line
    }, []);

    // 加载统计用的全部反馈列表
    const loadFeedbackList = async () => {
        setIsStatsLoading(true);
        try {
            const res = await fetch("/api/feedback/list");
            const result = await res.json();
            if (result.code === 200) {
                setFeedbackList(result.data || []);
            } else {
                setFeedbackList([]);
            }
        } catch (error) {
            setFeedbackList([]);
        }
        setIsStatsLoading(false);
    };

    // 切换到统计Tab或刷新时加载
    useEffect(() => {
        if (tab === "stats") {
            loadFeedbackList();
        }
        // eslint-disable-next-line
    }, [tab]);

    // 统计Tab下的刷新
    const handleStatsRefresh = () => {
        loadFeedbackList();
    };

    const loadFeedbacks = async (customFilters) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                size,
                ...filters,
                ...customFilters
            };
            Object.keys(params).forEach(
                (key) => (params[key] === "" || params[key] == null) && delete params[key]
            );
            if (params.type === "all") {
                params.type = ""
            }
            if (params.status === "all") {
                params.status = ""
            }
            const res = await fetch("/api/feedback/page", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(params)
            });
            const result = await res.json();
            if (result.code === 200) {
                setFeedbacks(result.data.content || []);
                setTotal(result.data.pageable?.total || 0);
            } else {
                setFeedbacks([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("加载反馈数据失败:", error);
            setFeedbacks([]);
            setTotal(0);
        }
        setIsLoading(false);
    };

    // 页面内容
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        反馈与建议收集系统
                    </h1>
                    <p className="text-gray-600 text-lg">倾听用户声音，持续改进产品</p>
                </div>
                <div className="mt-6">
                    {tab === "quick" && (
                        <QuickFeedback onSubmit={() => loadFeedbacks()}/>
                    )}
                    {tab === "stats" && (
                        <FeedbackStats
                            feedbacks={feedbackList}
                            isLoading={isStatsLoading}
                            onRefresh={handleStatsRefresh}
                        />
                    )}
                    {tab === "management" && (
                        <FeedbackManagement
                            feedbacks={feedbacks}
                            isLoading={isLoading}
                            onRefresh={() => loadFeedbacks()}
                            filters={filters}
                            setFilters={setFilters}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}