import  { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Eye,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function FeedbackManagement({
  feedbacks,
  isLoading,
  onRefresh,
  filters,
  setFilters,
  page = 1,
  size = 10,
  total = 0,
  onPageChange,
  onSizeChange
}) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolution, setResolution] = useState("");
  // 新增：负责团队输入
  const [responsibleTeam, setResponsibleTeam] = useState("");

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const statusMatch = filters.status === "all" || feedback.status === filters.status;
    const typeMatch = filters.type === "all" || feedback.type === filters.type;
    const keywordMatch = filters.keyword === "" ||
      feedback.content.toLowerCase().includes(filters.keyword.toLowerCase());

    return statusMatch && typeMatch && keywordMatch;
  });

  const getStatusColor = (status) => {
    const colors = {
      "待处理": "bg-yellow-100 text-yellow-700 border-yellow-200",
      "处理中": "bg-blue-100 text-blue-700 border-blue-200",
      "已解决": "bg-green-100 text-green-700 border-green-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      "待处理": Clock,
      "处理中": Settings,
      "已解决": CheckCircle
    };
    const IconComponent = icons[status] || AlertCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      "内容纠错": "bg-red-100 text-red-700",
      "需求建议": "bg-yellow-100 text-yellow-700",
      "批量反馈": "bg-blue-100 text-blue-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  // 修改此方法为HTTP请求
  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      await fetch(`/api/feedback/${feedbackId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus,
          resolution: resolution,
          responsible_team: responsibleTeam
        })
      });
      setShowDetailsDialog(false);
      setResolution("");
      setResponsibleTeam("");
      onRefresh();
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  const handleExportReport = () => {
    const csvContent = [
      ["ID", "类型", "内容摘要", "提交人", "状态", "创建时间"],
      ...filteredFeedbacks.map(f => [
        f.id,
        f.type,
        f.content.substring(0, 50) + "...",
        f.created_by?.split('@')[0] || '匿名',
        f.status,
        format(new Date(f.created_date), 'yyyy-MM-dd HH:mm')
      ])
    ].map(row => row.join(','))
     .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '反馈报告.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 计算分页
  const totalPages = Math.ceil(total / size);

  return (
    <div className="space-y-6">
      {/* 筛选和操作栏，移除外层Card */}
      <div className="grid gap-4 md:grid-cols-4 mb-2">
        <div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="待处理">待处理</SelectItem>
              <SelectItem value="处理中">处理中</SelectItem>
              <SelectItem value="已解决">已解决</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={filters.type}
            onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger className="h-10 text-sm">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="内容纠错">内容纠错</SelectItem>
              <SelectItem value="需求建议">需求建议</SelectItem>
              <SelectItem value="批量反馈">批量反馈</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="搜索反馈内容..."
              className="pl-10 h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 反馈列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-gray-200 bg-white/80 rounded-none shadow-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-32">反馈编号</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-28">反馈类别</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-[340px]">反馈标题</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-28">反馈人</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-32">反馈日期</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-28">反馈状态</th>
              <th className="px-4 py-2 font-semibold text-gray-700 border-b text-left w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-8 w-16" /></td>
                </tr>
              ))
            ) : (
              filteredFeedbacks.map((feedback) => {
                const isResolved = feedback.status === "已解决";
                return (
                  <tr key={feedback.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 w-32">#{String(feedback.id).slice(-6)}</td>
                    <td className="px-4 py-3 w-28">
                        <Badge variant="outline" className={getTypeColor(feedback.type) + " rounded-none pointer-events-auto"}>
                            <span className="ml-1">{feedback.type}</span>
                        </Badge>
                    </td>
                    <td className="px-4 py-3 max-w-[340px] truncate" title={feedback.content}>
                      {feedback.content.length > 60
                        ? feedback.content.substring(0, 60) + "..."
                        : feedback.content}
                    </td>
                    <td className="px-4 py-3 w-28">
                      {feedback.created_by?.split('@')[0] || '匿名用户'}
                    </td>
                    <td className="px-4 py-3 w-32">
                      {format(new Date(feedback.created_date), 'MM-dd HH:mm', { locale: zhCN })}
                    </td>
                    <td className="px-4 py-3 w-28">
                      <Badge variant="outline" className={getStatusColor(feedback.status) + " rounded-none"}>
                        {getStatusIcon(feedback.status)}
                        <span className="ml-1">{feedback.status}</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 w-24">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!isResolved) {
                            setSelectedFeedback(feedback);
                            setShowDetailsDialog(true);
                          }
                        }}
                        disabled={isResolved}
                        className={isResolved ? "opacity-50 pointer-events-none" : ""}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {/* 分页组件 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-4 px-2">
          <div className="text-gray-500 text-sm">
            共 {total} 条，{totalPages > 0 ? `第 ${page} / ${totalPages} 页` : "无数据"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">每页</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={size}
              onChange={e => {
                onSizeChange && onSizeChange(Number(e.target.value));
                onPageChange && onPageChange(1);
              }}
            >
              {[10, 20, 50].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">条</span>
            <button
              className="px-2 py-1 border rounded text-sm disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >上一页</button>
            <button
              className="px-2 py-1 border rounded text-sm disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >下一页</button>
          </div>
        </div>
      </div>

      {/* 详情对话框 */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              详情处理 - #{selectedFeedback ? String(selectedFeedback.id).slice(-6) : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>反馈类型</Label>
                  <div className="mt-1">
                    <Badge className={getTypeColor(selectedFeedback.type) + " rounded-none"}>
                      {selectedFeedback.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>当前状态</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(selectedFeedback.status) + " rounded-none"}>
                      {getStatusIcon(selectedFeedback.status)}
                      <span className="ml-1">{selectedFeedback.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>提交人</Label>
                  <p className="mt-1 text-sm">{selectedFeedback.created_by?.split('@')[0] || '匿名用户'}</p>
                </div>
                <div>
                  <Label>提交时间</Label>
                  <p className="mt-1 text-sm">
                    {format(new Date(selectedFeedback.created_date), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                  </p>
                </div>
              </div>
              <div>
                <Label>反馈内容</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-none">
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.content}</p>
                </div>
              </div>
              <div>
                <Label>处理结果</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="填写处理结果和解决方案..."
                  rows={4}
                  className="mt-1 rounded-none"
                />
              </div>
              {/* 新增：负责团队输入框 */}
              <div>
                <Label>负责团队</Label>
                <Input
                  value={responsibleTeam}
                  onChange={(e) => setResponsibleTeam(e.target.value)}
                  placeholder="如：产品团队"
                  className="mt-1 rounded-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  取消
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedFeedback.id, "处理中")}
                  variant="outline"
                  disabled={selectedFeedback.status !== "待处理"}
                >
                  标记为处理中
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(selectedFeedback.id, "已解决")}
                  className="bg-green-600 hover:bg-green-700"
                >
                  标记为已解决
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}