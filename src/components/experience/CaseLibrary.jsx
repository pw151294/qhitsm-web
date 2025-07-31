import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Bookmark, Calendar, Eye, Filter, Heart, MessageCircle, Plus, Tag, User} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";

export default function CaseLibrary() {
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        fault_type: "all",
        time_range: "all",
        likes_min: "",
        keyword: ""
    });
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newCase, setNewCase] = useState({
        title: "",
        fault_type: "",
        fault_phenomenon: "",
        cause_analysis: "",
        solution_steps: "",
        prevention_measures: "",
        tech_tags: []
    });

    // 新增：案例详情弹窗相关状态
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [caseDetail, setCaseDetail] = useState(null);

    // 加载案例列表
    const loadCases = async () => {
        setIsLoading(true);
        const params = {
            page: 1,
            size: 20,
            sort: "-created_date"
        };
        if (filters.fault_type && filters.fault_type !== "all") params.fault_type = filters.fault_type;
        if (filters.time_range && filters.time_range !== "all") params.time_range = filters.time_range;
        if (filters.likes_min) params.likes_min = Number(filters.likes_min);
        if (filters.keyword) params.keyword = filters.keyword;
        try {
            const resp = await fetch(`/api/cases/page`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(params)
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

    useEffect(() => {
        loadCases();
        // eslint-disable-next-line
    }, [filters.fault_type, filters.time_range, filters.likes_min, filters.keyword]);

    const handleCreateCase = async () => {
        try {
            const resp = await fetch("/api/cases/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newCase)
            });
            const result = await resp.json();
            if (result.code === 200) {
                setShowCreateDialog(false);
                setNewCase({
                    title: "",
                    fault_type: "",
                    fault_phenomenon: "",
                    cause_analysis: "",
                    solution_steps: "",
                    prevention_measures: "",
                    tech_tags: []
                });
                loadCases();
            } else {
                console.error("创建案例失败:", result.message);
            }
        } catch (error) {
            console.error("创建案例失败:", error);
        }
    };

    // 点赞处理函数
    const handleLike = async (caseId) => {
        try {
            const resp = await fetch(`/api/cases/${caseId}/like`, {
                method: "POST"
            });
            const result = await resp.json();
            if (result.code === 200) {
                // 点赞成功后，更新本地案例点赞数
                setCases(prevCases =>
                    prevCases.map(item =>
                        item.id === caseId
                            ? {...item, likes_count: (item.likes_count || 0) + 1}
                            : item
                    )
                );
            } else {
                // 可根据需要提示失败
                console.error("点赞失败:", result.message);
            }
        } catch (error) {
            console.error("点赞请求异常:", error);
        }
    };

    // 收藏处理函数
    const handleFavorite = async (caseId) => {
        try {
            const resp = await fetch(`/api/cases/${caseId}/favorite`, {
                method: "POST"
            });
            const result = await resp.json();
            if (result.code === 200) {
                // 收藏成功后，更新本地案例收藏数
                setCases(prevCases =>
                    prevCases.map(item =>
                        item.id === caseId
                            ? {...item, favorites_count: (item.favorites_count || 0) + 1}
                            : item
                    )
                );
            } else {
                console.error("收藏失败:", result.message);
            }
        } catch (error) {
            console.error("收藏请求异常:", error);
        }
    };

    // 新增：获取案例详情
    const handleShowDetail = async (caseId) => {
        setShowDetailDialog(true);
        setDetailLoading(true);
        try {
            const resp = await fetch(`/api/cases/${caseId}`);
            const result = await resp.json();
            if (result.code === 200 && result.data) {
                setCaseDetail(result.data);
            } else {
                setCaseDetail(null);
            }
        } catch (error) {
            setCaseDetail(null);
        }
        setDetailLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* 筛选条件 */}
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 py-2">
                <Select
                    value={filters.fault_type}
                    onValueChange={(value) => setFilters({...filters, fault_type: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="选择类型"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="网络故障">网络故障</SelectItem>
                        <SelectItem value="数据丢失">数据丢失</SelectItem>
                        <SelectItem value="系统崩溃">系统崩溃</SelectItem>
                        <SelectItem value="性能问题">性能问题</SelectItem>
                        <SelectItem value="安全问题">安全问题</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filters.time_range}
                    onValueChange={(value) => setFilters({...filters, time_range: value})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="选择时间"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部时间</SelectItem>
                        <SelectItem value="7">近7天</SelectItem>
                        <SelectItem value="30">近30天</SelectItem>
                        <SelectItem value="90">近3个月</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="number"
                    placeholder="最少点赞数"
                    value={filters.likes_min}
                    onChange={(e) => setFilters({...filters, likes_min: e.target.value})}
                />
                <Input
                    type="text"
                    placeholder="输入关键词"
                    value={filters.keyword}
                    onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                />
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 mr-2"/>
                            发布案例
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
                        <DialogHeader>
                            <DialogTitle>发布新案例</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>案例标题</Label>
                                <Input
                                    value={newCase.title}
                                    onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                                    placeholder="输入案例标题"
                                />
                            </div>
                            <div>
                                <Label>故障类型</Label>
                                <Select
                                    value={newCase.fault_type}
                                    onValueChange={(value) => setNewCase({...newCase, fault_type: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择故障类型"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="网络故障">网络故障</SelectItem>
                                        <SelectItem value="数据丢失">数据丢失</SelectItem>
                                        <SelectItem value="系统崩溃">系统崩溃</SelectItem>
                                        <SelectItem value="性能问题">性能问题</SelectItem>
                                        <SelectItem value="安全问题">安全问题</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>故障现象</Label>
                                <Textarea
                                    value={newCase.fault_phenomenon}
                                    onChange={(e) => setNewCase({
                                        ...newCase,
                                        fault_phenomenon: e.target.value
                                    })}
                                    placeholder="描述故障现象"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>原因分析</Label>
                                <Textarea
                                    value={newCase.cause_analysis}
                                    onChange={(e) => setNewCase({
                                        ...newCase,
                                        cause_analysis: e.target.value
                                    })}
                                    placeholder="分析故障原因"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>解决步骤</Label>
                                <Textarea
                                    value={newCase.solution_steps}
                                    onChange={(e) => setNewCase({
                                        ...newCase,
                                        solution_steps: e.target.value
                                    })}
                                    placeholder="详细的解决步骤"
                                    rows={4}
                                />
                            </div>
                            <div>
                                <Label>预防措施</Label>
                                <Textarea
                                    value={newCase.prevention_measures}
                                    onChange={(e) => setNewCase({
                                        ...newCase,
                                        prevention_measures: e.target.value
                                    })}
                                    placeholder="预防此类问题的措施"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="hover:text-[#478bff]"
                                >
                                    取消
                                </Button>
                                <Button
                                    onClick={handleCreateCase}
                                    className="bg-[#1f69ff] hover:bg-[#1f69ff]"
                                >
                                    发布案例
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            {/* 案例列表 */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="bg-white/80 backdrop-blur-sm rounded-none">
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4"/>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-20"/>
                                    <Skeleton className="h-6 w-24"/>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2"/>
                                <Skeleton className="h-4 w-2/3"/>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    cases.map((caseItem) => (
                        <Card key={caseItem.id}
                              className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 flex flex-col rounded-none">
                            <CardHeader>
                                <div className="relative">
                                    {/* 调整右侧padding，减少标题和标签与右上角作者日期的空白距离 */}
                                    <div className="pr-20">
                                        <CardTitle className="text-lg mb-2 break-words whitespace-pre-line">
                                            {caseItem.title}
                                        </CardTitle>
                                        <div className="flex gap-2 flex-wrap mb-1">
                                            <Badge variant="outline"
                                                   className="bg-blue-50 text-blue-700 border-blue-200">
                                                <Tag className="w-3 h-3 mr-1"/>
                                                {caseItem.fault_type}
                                            </Badge>
                                            {caseItem.tech_tags?.map((tag, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {/* 用户和日期右上角绝对定位 */}
                                    <div className="absolute top-0 right-0 flex flex-col items-end gap-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-4 h-4"/>
                                            {caseItem.created_by?.split('@')[0] || '匿名用户'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4"/>
                                            {format(new Date(caseItem.created_date), 'MM-dd', {locale: zhCN})}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                {/* 调整字体和间距 */}
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{caseItem.fault_phenomenon}</p>
                                {/* 统一底部：所有图标和按钮绝对底部对齐 */}
                                <div className="mt-auto w-full">
                                    <div className="flex flex-wrap justify-between items-center gap-2">
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4"/>
                                                {caseItem.views_count || 0}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-4 h-4"/>
                                                {caseItem.likes_count || 0}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4"/>
                                                {caseItem.comments_count || 0}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bookmark className="w-4 h-4"/>
                                                {caseItem.favorites_count || 0}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleShowDetail(caseItem.id)}
                                            >
                                                查看详情
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleLike(caseItem.id)}
                                            >
                                                <Heart className="w-4 h-4"/>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleFavorite(caseItem.id)}
                                            >
                                                <Bookmark className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
            {/* 新增：案例详情弹窗 */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl w-full bg-gradient-to-br from-blue-50 to-white border-blue-200 rounded-none">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-blue-700 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-500"/>
                            {caseDetail?.title || "案例详情"}
                        </DialogTitle>
                    </DialogHeader>
                    {detailLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-2/3"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-5/6"/>
                            <Skeleton className="h-4 w-4/6"/>
                        </div>
                    ) : caseDetail ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                    {caseDetail.fault_type}
                                </Badge>
                                {caseDetail.tech_tags?.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                                <span className="flex items-center gap-1 text-gray-500 text-xs ml-auto">
                                    <User className="w-4 h-4"/>{caseDetail.created_by?.split('@')[0] || "匿名用户"}
                                    <Calendar className="w-4 h-4 ml-3"/>{format(new Date(caseDetail.created_date), 'yyyy-MM-dd', {locale: zhCN})}
                                </span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1">故障现象</div>
                                <div className="bg-gray-50 p-2 text-gray-800 rounded-none">{caseDetail.fault_phenomenon}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1">原因分析</div>
                                <div className="bg-gray-50 p-2 text-gray-800 rounded-none">{caseDetail.cause_analysis}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1">解决步骤</div>
                                <div className="bg-gray-50 p-2 text-gray-800 whitespace-pre-line rounded-none">{caseDetail.solution_steps}</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1">预防措施</div>
                                <div className="bg-gray-50 p-2 text-gray-800 rounded-none">{caseDetail.prevention_measures}</div>
                            </div>
                            <div className="flex gap-6 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Eye className="w-4 h-4"/>{caseDetail.views_count || 0} 浏览</span>
                                <span className="flex items-center gap-1"><Heart className="w-4 h-4"/>{caseDetail.likes_count || 0} 点赞</span>
                                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4"/>{caseDetail.comments_count || 0} 评论</span>
                                <span className="flex items-center gap-1"><Bookmark className="w-4 h-4"/>{caseDetail.favorites_count || 0} 收藏</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400">未能加载案例详情</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}