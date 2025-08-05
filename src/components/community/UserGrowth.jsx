import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  Star,
  Award,
  MessageCircle,
  Heart,
  FileText
} from "lucide-react";
import Leaderboard from "./Leaderboard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const levels = [
  { level: 1, name: "新手", minPoints: 0, maxPoints: 99, color: "text-gray-600" },
  { level: 2, name: "初学者", minPoints: 100, maxPoints: 299, color: "text-green-600" },
  { level: 3, name: "进阶者", minPoints: 300, maxPoints: 599, color: "text-blue-600" },
  { level: 4, name: "熟练者", minPoints: 600, maxPoints: 999, color: "text-purple-600" },
  { level: 5, name: "专业者", minPoints: 1000, maxPoints: 1999, color: "text-orange-600" },
  { level: 6, name: "专家", minPoints: 2000, maxPoints: 3999, color: "text-red-600" },
  { level: 7, name: "大师", minPoints: 4000, maxPoints: 7999, color: "text-pink-600" },
  { level: 8, name: "宗师", minPoints: 8000, maxPoints: 15999, color: "text-yellow-600" },
  { level: 9, name: "传奇", minPoints: 16000, maxPoints: 31999, color: "text-indigo-600" },
  { level: 10, name: "神话", minPoints: 32000, maxPoints: 999999, color: "text-yellow-500" }
];

const getLevelInfo = (level) => levels.find(l => l.level === level) || levels[0];

const getProgressToNextLevel = (currentPoints, level) => {
  const currentLevelInfo = getLevelInfo(level);
  const nextLevelInfo = getLevelInfo(level + 1);
  if (level >= 10) return 100;
  const progress = ((currentPoints - currentLevelInfo.minPoints) /
    (nextLevelInfo.minPoints - currentLevelInfo.minPoints)) * 100;
  return Math.min(progress, 100);
};

const getPointsToNextLevel = (currentPoints, level) => {
  if (level >= 10) return 0;
  const nextLevelInfo = getLevelInfo(level + 1);
  return Math.max(0, nextLevelInfo.minPoints - currentPoints);
};

export default function UserGrowth({ users, isLoading }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [showLevelDialog, setShowLevelDialog] = React.useState(false);
  const [showPointsDialog, setShowPointsDialog] = React.useState(false);

  React.useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("/api/users/me");
      const json = await res.json();
      if (json.code !== 200) throw new Error(json.message || "获取用户信息失败");
      setCurrentUser(json.data);
    } catch (error) {
      console.error("获取当前用户失败:", error);
    }
  };

  if (isLoading || !currentUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userLevel = currentUser.level || 1;
  const userPoints = currentUser.points || 0;
  const levelInfo = getLevelInfo(userLevel);
  const progress = getProgressToNextLevel(userPoints, userLevel);
  const pointsNeeded = getPointsToNextLevel(userPoints, userLevel);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* 成长进度卡片 */}
        <Card className="bg-white shadow-sm rounded-none p-6 flex-1 flex flex-col min-w-[340px] h-full">
          <CardContent className="p-0 flex-1 flex flex-col">
            {/* 恢复标题和图标，左上角 */}
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-lg font-semibold text-gray-800">我的成长进度</span>
            </div>
            {/* 个人信息居中 */}
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-2">
                <img
                  src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || '用户')}&background=8b5cf6&color=fff&size=80`}
                  alt="用户头像"
                  className="w-20 h-20 mx-auto object-cover border-4 border-white shadow rounded-full"
                />
              </div>
              {/* 等级徽章已移除 */}
              <div className="font-bold text-gray-800 text-lg">{currentUser.full_name || '用户'}</div>
              <div className="flex items-center justify-center mt-2 gap-2">
                <Badge
                  className={`${levelInfo.color} bg-white px-2 py-1 text-xs font-semibold rounded-none`}
                  style={{ background: "white" }} // 防止hover变色
                >
                  {levelInfo.name}
                </Badge>
                {currentUser.certification && (
                  <Badge
                    className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs rounded-none flex items-center"
                    style={{ background: "#FEF3C7" }} // 防止hover变色
                  >
                    <Award className="w-3 h-3 mr-1" />
                    {currentUser.certification}
                  </Badge>
                )}
              </div>
            </div>
            {/* 积分进度 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>当前积分</span>
                <span>
                  {userPoints} / {userLevel < 10 ? getLevelInfo(userLevel + 1).minPoints : '∞'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-none h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {userLevel < 10
                  ? <>距离L{userLevel + 1}还需{pointsNeeded}积分</>
                  : <>已达最高等级</>
                }
              </div>
            </div>
            {/* 统计信息 */}
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {currentUser.posts_count || 0}
                </div>
                <p className="text-xs text-gray-600">发布帖子</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {currentUser.replies_count || 0}
                </div>
                <p className="text-xs text-gray-600">回复数量</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {currentUser.likes_received || 0}
                </div>
                <p className="text-xs text-gray-600">获得点赞</p>
              </div>
            </div>
            {/* 按钮组 */}
            <div className="flex gap-2 mt-2">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-none hover:from-blue-600 hover:to-purple-700 transition-all"
                onClick={() => setShowLevelDialog(true)}
              >
                <span className="mr-2"><Star className="w-4 h-4" /></span>
                查看等级规则
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-none hover:from-blue-600 hover:to-purple-700 transition-all"
                onClick={() => setShowPointsDialog(true)}
              >
                <span className="mr-2"><FileText className="w-4 h-4" /></span>
                积分获取方式
              </Button>
            </div>
            {/* 等级规则弹窗 */}
            <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
              <DialogContent className="max-w-lg rounded-none p-0 overflow-hidden">
                <div className="bg-white p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl mb-4">等级评选规则</DialogTitle>
                  </DialogHeader>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 bg-white rounded-lg shadow">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left">等级</th>
                          <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left">称号</th>
                          <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left">积分区间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {levels.map(l => (
                          <tr key={l.level}>
                            <td className="px-4 py-2 border-b">
                              <Badge className={`${l.color} bg-white border px-2 py-1`}>L{l.level}</Badge>
                            </td>
                            <td className="px-4 py-2 border-b">{l.name}</td>
                            <td className="px-4 py-2 border-b">
                              {l.level < 10
                                ? `${l.minPoints} ~ ${l.maxPoints} 积分`
                                : `≥ ${l.minPoints} 积分`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" className="px-8" onClick={() => setShowLevelDialog(false)}>
                      关闭
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {/* 积分获取方式弹窗 */}
            <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
              <DialogContent className="max-w-md rounded-none p-0 overflow-hidden">
                <div className="bg-white p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl mb-4">积分获取方式</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg flex flex-col items-center">
                      <FileText className="w-6 h-6 text-blue-600 mb-1" />
                      <div className="font-medium text-sm mb-0.5">发布帖子</div>
                      <Badge className="bg-blue-100 text-blue-700 text-xs mb-1">+10 积分</Badge>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg flex flex-col items-center">
                      <MessageCircle className="w-6 h-6 text-green-600 mb-1" />
                      <div className="font-medium text-sm mb-0.5">回复评论</div>
                      <Badge className="bg-green-100 text-green-700 text-xs mb-1">+5 积分</Badge>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg flex flex-col items-center">
                      <Heart className="w-6 h-6 text-red-600 mb-1" />
                      <div className="font-medium text-sm mb-0.5">获得点赞</div>
                      <Badge className="bg-red-100 text-red-700 text-xs mb-1">+2 积分</Badge>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg flex flex-col items-center">
                      <Star className="w-6 h-6 text-yellow-600 mb-1" />
                      <div className="font-medium text-sm mb-0.5">精华内容</div>
                      <Badge className="bg-yellow-100 text-yellow-700 text-xs mb-1">+50 积分</Badge>
                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" className="px-8" onClick={() => setShowPointsDialog(false)}>
                      关闭
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        {/* Top3卡片并排，传递紧凑模式 */}
        <div className="flex-1 min-w-[320px] flex flex-col h-full">
          <Leaderboard users={users} isLoading={isLoading} compact />
        </div>
      </div>
    </div>
  );
}