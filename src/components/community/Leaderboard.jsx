import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {
    Trophy,
    Medal,
    Award,
    Crown,
    Star,
    TrendingUp,
    MessageCircle,
    Heart
} from "lucide-react";

export default function Leaderboard({users, isLoading}) {
    const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);
    const [sortedUsers, setSortedUsers] = useState([]);

    // 加载用户列表（按照贡献排行）
    React.useEffect(() => {
        loadSortedUsers()
    }, [])
    const loadSortedUsers = async () => {
        try {
            const res = await fetch('/api/users/list')
            const resp = await res.json();
            if (resp.code !== 200) throw new Error(resp.message || "获取用户列表失败");
            setSortedUsers(resp.data);
        } catch (error) {
            console.error("获取当前用户失败:", error);
        }
    }

    const topUsers = sortedUsers.slice(0, 3);
    const otherUsers = sortedUsers.slice(3);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500"/>;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400"/>;
        if (rank === 3) return <Award className="w-6 h-6 text-orange-600"/>;
        return <Trophy className="w-5 h-5 text-blue-600"/>;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return "from-yellow-400 to-yellow-600";
        if (rank === 2) return "from-gray-300 to-gray-500";
        if (rank === 3) return "from-orange-400 to-orange-600";
        return "from-blue-300 to-blue-500";
    };

    const getLevelBadge = (level) => {
        if (level >= 8) return {
            text: `L${level}`,
            className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
        };
        if (level >= 5) return {text: `L${level}`, className: "bg-gradient-to-r from-blue-400 to-blue-600 text-white"};
        return {text: `L${level}`, className: "bg-gradient-to-r from-gray-400 to-gray-600 text-white"};
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32"/>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="text-center p-4">
                                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2"/>
                                    <Skeleton className="h-4 w-20 mx-auto mb-1"/>
                                    <Skeleton className="h-3 w-16 mx-auto"/>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top 3 用户展示 */}
            <Card className="bg-white rounded-xl shadow-md p-6 mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Trophy className="w-6 h-6 text-yellow-600"/>
                        贡献排行榜 - Top 3
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        {topUsers.map((user) => {
                            const levelBadge = getLevelBadge(user.level || 1);
                            return (
                                <div key={user.id} className="text-center relative">
                                    {/* 排名背景 */}
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${getRankColor(user.rank)} opacity-10 rounded-xl`}/>

                                    <div className="relative p-6">
                                        {/* 排名图标 */}
                                        <div className="flex justify-center mb-4">
                                            {getRankIcon(user.rank)}
                                        </div>

                                        {/* 用户头像 */}
                                        <div className="relative inline-block mb-4">
                                            <div
                                                className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                <img
                                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=8b5cf6&color=fff`}
                                                    alt="用户头像"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute -top-2 -right-2">
                                                <Badge
                                                    className={levelBadge.className + " px-2 py-1 text-xs font-bold shadow-lg"}>
                                                    {levelBadge.text}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* 用户信息 */}
                                        <h3 className="font-bold text-lg mb-1">{user.full_name || '用户'}</h3>
                                        <div className="text-2xl font-bold text-purple-600 mb-2">
                                            {user.points || 0} 积分
                                        </div>

                                        {/* 认证标签 */}
                                        {user.certification && (
                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 mb-2">
                                                <Star className="w-3 h-3 mr-1"/>
                                                {user.certification}
                                            </Badge>
                                        )}

                                        {/* 统计信息 */}
                                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                            <div>
                                                <div className="font-medium">{user.posts_count || 0}</div>
                                                <div>帖子</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.replies_count || 0}</div>
                                                <div>回复</div>
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.likes_received || 0}</div>
                                                <div>点赞</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 更多排名 */}
            {otherUsers.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600"/>
                                更多排名
                            </CardTitle>
                            {otherUsers.length > 5 && (
                                <Dialog open={showFullLeaderboard} onOpenChange={setShowFullLeaderboard}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">查看完整排行榜</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>完整排行榜</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-2">
                                            {sortedUsers.map((user) => {
                                                const levelBadge = getLevelBadge(user.level || 1);
                                                return (
                                                    <div key={user.id}
                                                         className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                                                        <div className="w-8 text-center font-bold text-gray-600">
                                                            #{user.rank}
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
                                                                <span
                                                                    className="font-medium">{user.full_name || '用户'}</span>
                                                                <Badge
                                                                    className={levelBadge.className + " text-xs px-2 py-1"}>
                                                                    {levelBadge.text}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.posts_count || 0} 帖子
                                                                • {user.replies_count || 0} 回复
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div
                                                                className="font-bold text-purple-600">{user.points || 0}</div>
                                                            <div className="text-xs text-gray-500">积分</div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {otherUsers.slice(0, 5).map((user) => {
                                const levelBadge = getLevelBadge(user.level || 1);
                                return (
                                    <div key={user.id}
                                         className="flex items-center gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                                        <div className="w-8 text-center font-bold text-gray-600">
                                            #{user.rank}
                                        </div>

                                        <div
                                            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                            <img
                                                src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=8b5cf6&color=fff`}
                                                alt="用户头像"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{user.full_name || '用户'}</span>
                                                <Badge className={levelBadge.className + " text-xs px-2 py-1"}>
                                                    {levelBadge.text}
                                                </Badge>
                                                {user.certification && (
                                                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                                        {user.certification}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-3 h-3"/>
                                                    {user.posts_count || 0} 帖子
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-3 h-3"/>
                                                    {user.likes_received || 0} 点赞
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-bold text-purple-600 text-lg">{user.points || 0}</div>
                                            <div className="text-xs text-gray-500">积分</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}