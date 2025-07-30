import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Star, 
  Award, 
  MessageCircle,
  Heart,
  FileText,
  Target
} from "lucide-react";

export default function UserGrowth({ users, isLoading }) {
  const [currentUser, setCurrentUser] = React.useState(null);

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

  const getLevelInfo = (level) => {
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
    
    return levels.find(l => l.level === level) || levels[0];
  };

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

  if (isLoading || !currentUser) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
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
      {/* 用户成长概览 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            我的成长进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || '用户')}&background=8b5cf6&color=fff`}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2">
                <Badge className={`${levelInfo.color} bg-white border-2 px-2 py-1 shadow-md`}>
                  L{userLevel}
                </Badge>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{currentUser.full_name || '用户'}</h3>
                <Badge className={`${levelInfo.color} bg-white px-3 py-1 text-sm font-semibold`}>
                  {levelInfo.name}
                </Badge>
                {currentUser.certification && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Award className="w-3 h-3 mr-1" />
                    {currentUser.certification}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">成长进度</span>
                  <span className="font-medium">
                    {userPoints} / {userLevel < 10 ? getLevelInfo(userLevel + 1).minPoints : '∞'} 积分
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>当前等级：L{userLevel} {levelInfo.name}</span>
                  {userLevel < 10 ? (
                    <span>距离下一级还需 {pointsNeeded} 积分</span>
                  ) : (
                    <span>已达最高等级</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 积分获取方式 */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            积分获取方式
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">发布帖子</h4>
              <p className="text-sm text-gray-600 mb-2">分享知识和经验</p>
              <Badge className="bg-blue-100 text-blue-700">+10 积分</Badge>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">回复评论</h4>
              <p className="text-sm text-gray-600 mb-2">参与讨论交流</p>
              <Badge className="bg-green-100 text-green-700">+5 积分</Badge>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">获得点赞</h4>
              <p className="text-sm text-gray-600 mb-2">内容受到认可</p>
              <Badge className="bg-red-100 text-red-700">+2 积分</Badge>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <h4 className="font-medium mb-1">精华内容</h4>
              <p className="text-sm text-gray-600 mb-2">被评为精华帖</p>
              <Badge className="bg-yellow-100 text-yellow-700">+50 积分</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个人统计 */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-600" />
            个人统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {currentUser.posts_count || 0}
              </div>
              <p className="text-sm text-gray-600">发布帖子</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {currentUser.replies_count || 0}
              </div>
              <p className="text-sm text-gray-600">回复数量</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {currentUser.likes_received || 0}
              </div>
              <p className="text-sm text-gray-600">获得点赞</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}