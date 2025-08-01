import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Trophy,
    Star,
    MessageCircle,
    Heart,
    User as UserIcon,
    Mail,
    Calendar as CalendarIcon
} from "lucide-react";

// 分页组件（如有全局Pagination组件可替换）
function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50] }) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    上一页
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                        key={i + 1}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(i + 1)}
                        className={page === i + 1 ? "bg-blue-600 text-white" : ""}
                    >
                        {i + 1}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    下一页
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">每页</span>
                <select
                    className="border rounded px-2 py-1 text-sm"
                    value={pageSize}
                    onChange={e => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">条，共 {total} 人</span>
            </div>
        </div>
    );
}

export default function Leaderboard({ users, isLoading, compact }) {
    const [sortedUsers, setSortedUsers] = useState([]);
    const [userDetail, setUserDetail] = useState(null);
    const [showUserDetailDialog, setShowUserDetailDialog] = useState(false);

    // 新增：完整排行榜弹窗相关状态
    const [showFullDialog, setShowFullDialog] = useState(false);
    const [fullList, setFullList] = useState([]);
    const [fullTotal, setFullTotal] = useState(0);
    const [fullPage, setFullPage] = useState(1);
    const [fullPageSize, setFullPageSize] = useState(20);
    const [fullLoading, setFullLoading] = useState(false);

    React.useEffect(() => {
        loadSortedUsers();
    }, []);
    const loadSortedUsers = async () => {
        try {
            const res = await fetch('/api/users/list');
            const resp = await res.json();
            if (resp.code !== 200) throw new Error(resp.message || "获取用户列表失败");
            setSortedUsers(resp.data);
        } catch (error) {
            console.error("获取当前用户失败:", error);
        }
    };

    // Top3
    const topUsers = sortedUsers.slice(0, 3);

    // 详情弹窗
    const handleShowUserDetail = async (userId) => {
        try {
            const res = await fetch(`/api/users/detail/${userId}`);
            const data = await res.json();
            if (data.code === 200) {
                setUserDetail(data.data);
                setShowUserDetailDialog(true);
            } else {
                setUserDetail(null);
                setShowUserDetailDialog(false);
                console.error("获取用户详情失败:", data.message);
            }
        } catch (err) {
            setUserDetail(null);
            setShowUserDetailDialog(false);
            console.error("请求用户详情异常:", err);
        }
    };

    // 完整排行榜弹窗
    const fetchFullList = async (page = 1, size = 20) => {
        setFullLoading(true);
        try {
            const res = await fetch("/api/users/page", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ page, size })
            });
            const data = await res.json();
            if (data.code === 200 && data.data) {
                setFullList(data.data.content || []);
                setFullTotal(data.data.pageable?.total || 0);
            } else {
                setFullList([]);
                setFullTotal(0);
            }
        } catch (e) {
            setFullList([]);
            setFullTotal(0);
        }
        setFullLoading(false);
    };

    const openFullDialog = () => {
        setShowFullDialog(true);
        fetchFullList(1, fullPageSize);
        setFullPage(1);
    };

    const handleFullPageChange = (page) => {
        setFullPage(page);
        fetchFullList(page, fullPageSize);
    };

    const handleFullPageSizeChange = (size) => {
        setFullPageSize(size);
        setFullPage(1);
        fetchFullList(1, size);
    };

    const getLevelBadge = (level) => {
        if (level >= 8) return {
            text: `L${level}`,
            className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
        };
        if (level >= 5) return { text: `L${level}`, className: "bg-gradient-to-r from-blue-400 to-blue-600 text-white" };
        return { text: `L${level}`, className: "bg-gradient-to-r from-gray-400 to-gray-600 text-white" };
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="text-center p-4">
                                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                                    <Skeleton className="h-4 w-20 mx-auto mb-1" />
                                    <Skeleton className="h-3 w-16 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={compact ? "" : "space-y-6"}>
            {/* Top 3 用户展示 */}
            <Card
                className={`bg-white shadow-md rounded-none ${compact ? "p-4" : "p-6 mb-6"} flex flex-col h-full min-h-[420px]`}
                style={compact ? { minHeight: 0, height: "100%" } : { minHeight: 420, height: "100%" }}
            >
                <CardHeader className={compact ? "pb-2" : ""}>
                    <CardTitle className={`flex items-center gap-2 ${compact ? "text-lg" : "text-xl"}`}>
                        <Trophy className={`w-5 h-5 text-yellow-600 ${compact ? "" : "w-6 h-6"}`} />
                        贡献排行榜 - Top 3
                    </CardTitle>
                </CardHeader>
                <CardContent className={`flex flex-col flex-1 justify-between pt-0 ${compact ? "" : ""}`}>
                    {/* 仅展示头像、full_name、积分 */}
                    <div className="flex flex-col gap-4 flex-1 justify-center">
                        {topUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`flex items-center gap-6 p-3 bg-gradient-to-br from-gray-50 to-white shadow group hover:shadow-lg transition cursor-pointer rounded-none min-h-[64px]`}
                                onClick={() => handleShowUserDetail(user.id)}
                            >
                                {/* 头像 */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                        <img
                                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=8b5cf6&color=fff`}
                                            alt="用户头像"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                {/* 用户名 */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-base font-bold truncate">{user.full_name || '用户'}</span>
                                </div>
                                {/* 积分 */}
                                <div className="flex flex-col items-end min-w-[70px]">
                                    <div className="text-xl font-bold text-purple-600 mb-1">
                                        {user.points || 0}
                                    </div>
                                    <div className="text-xs text-gray-500">积分</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 底部“查看完整排行榜”始终贴底 */}
                    <div className="mt-4 flex justify-center">
                        <span
                            className="text-blue-600 cursor-pointer hover:underline font-medium"
                            onClick={openFullDialog}
                        >
                            查看完整排行榜
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* 用户详情弹窗 */}
            <Dialog open={showUserDetailDialog} onOpenChange={setShowUserDetailDialog}>
                <DialogContent className="max-w-lg rounded-xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-8">
                        {userDetail ? (
                            <div className="flex flex-col items-center gap-4">
                                {/* 头像 */}
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg">
                                        <img
                                            src={userDetail.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetail.full_name || '用户')}&background=8b5cf6&color=fff`}
                                            alt="用户头像"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                                {/* 姓名与等级 */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-2xl font-bold text-gray-900">{userDetail.full_name}</span>
                                    <Badge className="bg-gradient-to-r from-purple-400 to-purple-700 text-white px-3 py-1 text-sm font-semibold">
                                        等级 L{userDetail.level}
                                    </Badge>
                                    {userDetail.certification && (
                                        <Badge
                                            className="bg-yellow-100 text-yellow-800 border-yellow-300 mt-1"
                                            style={{ background: "#FEF3C7" }} // 防止hover变色
                                        >
                                            <Star className="w-3 h-3 mr-1" />
                                            {userDetail.certification}
                                        </Badge>
                                    )}
                                </div>
                                {/* 简介 */}
                                {userDetail.bio && (
                                    <div className="text-gray-600 text-center text-sm px-2 py-1">
                                        {userDetail.bio}
                                    </div>
                                )}
                                {/* 详细信息 */}
                                <div className="w-full mt-2 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="truncate">{userDetail.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <CalendarIcon className="w-4 h-4 text-green-500" />
                                        <span>
                                            {userDetail.created_date
                                                ? (() => {
                                                    const d = userDetail.created_date;
                                                    if (typeof d === "string") {
                                                        return d.slice(0, 10);
                                                    }
                                                    if (d instanceof Date && !isNaN(d)) {
                                                        return d.toISOString().slice(0, 10);
                                                    }
                                                    if (typeof d === "number") {
                                                        return new Date(d).toISOString().slice(0, 10);
                                                    }
                                                    return "";
                                                })()
                                                : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <MessageCircle className="w-4 h-4 text-purple-500" />
                                        <span>帖子 {userDetail.posts_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <Heart className="w-4 h-4 text-red-500" />
                                        <span>点赞 {userDetail.likes_received || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                        <span>回复 {userDetail.replies_count || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        <span>积分 {userDetail.points || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">暂无用户详情</div>
                        )}
                        <div className="flex justify-center mt-6">
                            <Button variant="outline" className="px-8" onClick={() => setShowUserDetailDialog(false)}>
                                关闭
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 完整排行榜弹窗 */}
            <Dialog open={showFullDialog} onOpenChange={setShowFullDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl p-0">
                    <div className="bg-white p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl mb-4">贡献排行榜</DialogTitle>
                        </DialogHeader>
                        {fullLoading ? (
                            <div className="text-center text-gray-400 py-12">加载中...</div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {fullList.map((user, idx) => {
                                        const levelBadge = getLevelBadge(user.level || 1);
                                        return (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleShowUserDetail(user.id)}
                                            >
                                                <div className="w-8 text-center font-bold text-gray-600">
                                                    #{(fullPage - 1) * fullPageSize + idx + 1}
                                                </div>
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    <img
                                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=8b5cf6&color=fff`}
                                                        alt="头像"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{user.full_name || '用户'}</span>
                                                        <Badge className={levelBadge.className + " text-xs px-2 py-1"}>
                                                            {levelBadge.text}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.posts_count || 0} 帖子 • {user.replies_count || 0} 回复
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600">{user.points || 0}</div>
                                                    <div className="text-xs text-gray-500">积分</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <Pagination
                                    page={fullPage}
                                    pageSize={fullPageSize}
                                    total={fullTotal}
                                    onPageChange={handleFullPageChange}
                                    onPageSizeChange={handleFullPageSizeChange}
                                    pageSizeOptions={[10, 20, 50]}
                                />
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}