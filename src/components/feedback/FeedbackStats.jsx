import "react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Clock, 
  Settings, 
  CheckCircle, 
  TrendingUp,
  AlertTriangle,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function FeedbackStats({ feedbacks, isLoading, onRefresh }) {
  const getStats = () => {
    const pending = feedbacks.filter(f => f.status === "待处理").length;
    const processing = feedbacks.filter(f => f.status === "处理中").length;
    const resolved = feedbacks.filter(f => f.status === "已解决").length;
    const total = feedbacks.length;
    const processingRate = total > 0 ? ((processing + resolved) / total * 100).toFixed(1) : 0;
    
    return { pending, processing, resolved, total, processingRate };
  };

  const getTypeDistribution = () => {
    const types = {};
    feedbacks.forEach(f => {
      types[f.type] = (types[f.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const getHotIssues = () => {
    // 模拟热点问题（按频次）
    const issues = {};
    feedbacks.forEach(f => {
      const key = f.content.substring(0, 20) + "...";
      issues[key] = (issues[key] || 0) + 1;
    });
    
    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => ({ issue, count }));
  };

  const stats = getStats();
  const typeData = getTypeDistribution();
  const hotIssues = getHotIssues();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const statCards = [
    {
      title: "待处理",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "处理中",
      value: stats.processing,
      icon: Settings,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "已解决",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "处理率",
      value: `${stats.processingRate}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  // 新增：高频问题详情弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // 新增：点击高频问题获取详情
  const handleHotIssueClick = async (issue) => {
    // 通过内容模糊匹配找到第一个对应的反馈id
    const matched = feedbacks.find(f => f.content.startsWith(issue.replace("...", "")));
    if (!matched) return;
    setDetailLoading(true);
    setDetailDialogOpen(true);
    try {
      const res = await fetch(`/api/feedback/${matched.id}`);
      const result = await res.json();
      if (result.code === 200) {
        setDetailData(result.data);
      } else {
        setDetailData(null);
      }
    } catch (e) {
      setDetailData(null);
    }
    setDetailLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.title} className={`${card.bgColor} ${card.borderColor} border-2 min-h-[110px] flex rounded-none`}>
              <CardContent className="p-4 flex-1 flex items-center">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`p-3 bg-white/80 ${card.color} rounded-none`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* 图表区域 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 问题类型分布 */}
        <Card className="bg-white/80 backdrop-blur-sm min-h-[340px] flex flex-col rounded-none">
          <CardHeader className="pt-6 pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              问题类型分布
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center pt-2">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="54%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={65}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* 月度处理趋势 */}
        <Card className="bg-white/80 backdrop-blur-sm min-h-[340px] flex flex-col rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              月度处理趋势
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { month: '1月', 处理数: 45, 总数: 52 },
                    { month: '2月', 处理数: 38, 总数: 41 },
                    { month: '3月', 处理数: 62, 总数: 68 },
                    { month: '4月', 处理数: 55, 总数: 63 },
                    { month: '5月', 处理数: 48, 总数: 52 },
                    { month: '6月', 处理数: 71, 总数: 79 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="处理数" fill="#10B981" />
                  <Bar dataKey="总数" fill="#E5E7EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 热点问题 */}
      <Card className="bg-white/80 backdrop-blur-sm min-h-[120px] rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Top 5 高频问题
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {hotIssues.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-400"
                onClick={() => handleHotIssueClick(item.issue)}
                title="点击查看详情"
                style={{ borderRadius: 0 }}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0 rounded-none">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{item.issue}</span>
                </div>
                <Badge className="bg-red-100 text-red-700 rounded-none">
                  {item.count} 次
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* 高频问题详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-xl shadow-2xl border-0 p-0 overflow-hidden rounded-none">
          <div className="bg-gradient-to-br from-blue-50 to-white p-6">
            <DialogHeader>
              {/* 删除标题 */}
            </DialogHeader>
            {detailLoading ? (
              <div className="py-12 text-center text-blue-500 text-lg">加载中...</div>
            ) : detailData ? (
              <div className="space-y-4 mt-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* 反馈类型标签 */}
                  <Badge className="bg-blue-100 text-blue-700 pointer-events-none">{detailData.type}</Badge>
                  {/* 反馈状态标签，按状态配色 */}
                  <Badge
                    className={
                      "pointer-events-none " +
                      (detailData.status === "待处理"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : detailData.status === "处理中"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : detailData.status === "已解决"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200")
                    }
                  >
                    {detailData.status}
                  </Badge>
                  {/* 优先级标签，按优先级配色 */}
                  <Badge
                    className={
                      "pointer-events-none " +
                      (detailData.priority === "高"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : detailData.priority === "中"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : detailData.priority === "低"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-700 border-gray-200")
                    }
                  >
                    {detailData.priority}优先级
                  </Badge>
                  {detailData.is_duplicate && (
                    <Badge className="bg-yellow-100 text-yellow-700 pointer-events-none">重复反馈</Badge>
                  )}
                </div>
                {/* 内容展示区域增加最大高度和滚动 */}
                <div className="bg-white border border-blue-100 p-4 text-gray-800 text-base leading-relaxed max-h-56 overflow-auto rounded-none">
                  <span className="font-semibold text-gray-700">内容：</span>
                  {detailData.content}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">提交人：</span>
                    <span className="font-medium">{detailData.submitter_info?.full_name || detailData.created_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">邮箱：</span>
                    <span>{detailData.submitter_info?.email || detailData.created_by}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">提交时间：</span>
                    <span>
                      {detailData.created_date
                        ? new Date(detailData.created_date).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">负责团队：</span>
                    <span>{detailData.responsible_team || "未指定"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">处理结果：</span>
                  <span className="ml-2">{detailData.resolution || <span className="text-gray-400">暂无</span>}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-red-500">加载失败，请重试</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}