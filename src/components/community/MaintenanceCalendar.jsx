import React, {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Users,
    Trophy,
    BookOpen,
    Wrench,
    Video,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths
} from "date-fns";
import {zhCN} from "date-fns/locale";

async function loadEvents({
                              type,
                              start_date,
                              end_date,
                              is_featured,
                              status
                          } = {}) {
    const params = {
        ...(type ? {type} : {}),
        ...(start_date ? {start_date} : {}),
        ...(end_date ? {end_date} : {}),
        ...(is_featured !== undefined ? {is_featured} : {}),
        ...(status ? {status} : {})
    };
    const resp = await fetch(`/api/events`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    });
    const data = await resp.json();
    if (data.code === 200) {
        // 响应 data 直接为数组
        return data.data || [];
    }
    throw new Error(data.message || "加载活动失败");
}

export default function MaintenanceCalendar({events, isLoading, onRefresh, onLoadEvents}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDialog, setShowEventDialog] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        type: "",
        start_date: "",
        end_date: "",
        max_participants: ""
    });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({start: monthStart, end: monthEnd});

    const getEventIcon = (type) => {
        const icons = {
            "技术专题周": BookOpen,
            "故障复盘大赛": Trophy,
            "运维技能竞赛": Wrench,
            "在线研讨会": Video
        };
        return icons[type] || CalendarIcon;
    };

    const getEventColor = (type) => {
        const colors = {
            "技术专题周": "bg-blue-100 text-blue-700 border-blue-200",
            "故障复盘大赛": "bg-red-100 text-red-700 border-red-200",
            "运维技能竞赛": "bg-green-100 text-green-700 border-green-200",
            "在线研讨会": "bg-purple-100 text-purple-700 border-purple-200"
        };
        return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getEventsForDate = (date) => {
        return events.filter(event => {
            const eventDate = new Date(event.start_date);
            return isSameDay(eventDate, date);
        });
    };

    const handleCreateEvent = async () => {
        try {
            const payload = {
                title: newEvent.title,
                description: newEvent.description,
                type: newEvent.type,
                start_date: newEvent.start_date,
                end_date: newEvent.end_date,
                max_participants: newEvent.max_participants,
                is_featured: true
            };
            const resp = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            if (data.code !== 200) {
                throw new Error(data.message || "创建活动失败");
            }
            setShowCreateDialog(false);
            setNewEvent({
                title: "",
                description: "",
                type: "",
                start_date: "",
                end_date: "",
                max_participants: ""
            });
            // 创建活动后刷新活动信息
            if (onRefresh) {
                onRefresh();
            }
        } catch (error) {
            console.error("创建活动失败:", error);
        }
    };

    const navigateMonth = (direction) => {
        if (direction === 'prev') {
            setCurrentDate(subMonths(currentDate, 1));
        } else {
            setCurrentDate(addMonths(currentDate, 1));
        }
        // 切换月份时刷新活动信息
        if (onRefresh) {
            onRefresh();
        }
    };

    // 可选：暴露 loadEvents 给父组件
    useEffect(() => {
        if (onLoadEvents) {
            onLoadEvents(loadEvents);
        }
    }, [onLoadEvents]);

    // 首次加载时自动拉取活动信息
    useEffect(() => {
        if (onRefresh) {
            onRefresh();
        }
        // 只在首次挂载时执行
        // eslint-disable-next-line
    }, []);

    // 近期活动状态与样式
    const getEventStatus = (event) => {
        switch (event.status) {
            case "即将开始":
                return {label: "即将开始", className: "bg-blue-100 text-blue-800"};
            case "已结束":
                return {label: "已结束", className: "bg-gray-100 text-gray-800"};
            default:
                return {label: "报名中", className: "bg-green-100 text-green-800"};
        }
    };

    return (
        <div className="space-y-6">
            {/* 日历头部 */}
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <CalendarIcon className="w-6 h-6 text-purple-600"/>
                                运维日历
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                                    <ChevronLeft className="w-4 h-4"/>
                                </Button>
                                <h3 className="text-lg font-semibold min-w-32 text-center">
                                    {format(currentDate, 'yyyy年 MM月', {locale: zhCN})}
                                </h3>
                                <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                                    <ChevronRight className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>

                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                {/* 创建活动按钮 */}
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2"/>
                                    创建活动
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>创建新活动</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>活动标题</Label>
                                        <Input
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                            placeholder="输入活动标题"
                                        />
                                    </div>
                                    <div>
                                        <Label>活动类型</Label>
                                        <Select
                                            value={newEvent.type}
                                            onValueChange={(value) => setNewEvent({...newEvent, type: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择活动类型"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="技术专题周">技术专题周</SelectItem>
                                                <SelectItem value="故障复盘大赛">故障复盘大赛</SelectItem>
                                                <SelectItem value="运维技能竞赛">运维技能竞赛</SelectItem>
                                                <SelectItem value="在线研讨会">在线研讨会</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>开始日期</Label>
                                            <Input
                                                type="date"
                                                value={newEvent.start_date}
                                                onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>结束日期</Label>
                                            <Input
                                                type="date"
                                                value={newEvent.end_date}
                                                onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>最大参与人数</Label>
                                        <Input
                                            type="number"
                                            value={newEvent.max_participants}
                                            onChange={(e) => setNewEvent({
                                                ...newEvent,
                                                max_participants: parseInt(e.target.value) || ""
                                            })}
                                            placeholder="输入最大参与人数"
                                        />
                                    </div>
                                    <div>
                                        <Label>活动描述</Label>
                                        <Textarea
                                            value={newEvent.description}
                                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                            placeholder="详细描述活动内容和安排"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                            取消
                                        </Button>
                                        <Button onClick={handleCreateEvent}>
                                            创建活动
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
            </Card>

            {/* 主体两列布局：左侧日历，右侧近期活动 */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* 左侧：日历网格 */}
                <div className="flex-1 min-w-0">
                    <Card className="bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6">
                            {/* 星期头部 */}
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day) => (
                                    <div key={day}
                                         className="p-2 text-center font-medium text-gray-600 bg-gray-50 rounded">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* 日期网格 */}
                            <div className="grid grid-cols-7 gap-2">
                                {monthDays.map((day) => {
                                    const dayEvents = getEventsForDate(day);
                                    const isCurrentMonth = isSameMonth(day, currentDate);
                                    const isTodayDate = isToday(day);

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={`min-h-24 p-2 border rounded-lg transition-colors ${
                                                isCurrentMonth
                                                    ? isTodayDate
                                                        ? 'bg-purple-50 border-purple-300'
                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                    : 'bg-gray-50 border-gray-100 text-gray-400'
                                            }`}
                                        >
                                            <div className={`text-sm font-medium mb-1 ${
                                                isTodayDate ? 'text-purple-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                            }`}>
                                                {format(day, 'd')}
                                            </div>

                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 2).map((event) => {
                                                    const IconComponent = getEventIcon(event.type);
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            onClick={() => {
                                                                setSelectedEvent(event);
                                                                setShowEventDialog(true);
                                                            }}
                                                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getEventColor(event.type)}`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                <IconComponent className="w-3 h-3 flex-shrink-0"/>
                                                                <span className="truncate">{event.type}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {dayEvents.length > 2 && (
                                                    <div className="text-xs text-gray-500 px-1">
                                                        +{dayEvents.length - 2} 更多
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 右侧：近期活动栏 */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="mb-6">
                        {/* 创建活动按钮已在头部，无需重复 */}
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-0">
                        <div className="p-6">
                            <h4 className="font-medium text-gray-800 mb-4">近期活动</h4>
                            <div className="space-y-4">
                                {events.slice(0, 3).map(event => {
                                    const status = getEventStatus(event);
                                    // 日期范围展示
                                    const start = event.start_date ? new Date(event.start_date) : null;
                                    const end = event.end_date ? new Date(event.end_date) : null;
                                    let dateStr = "";
                                    if (start && end && event.end_date !== event.start_date) {
                                        dateStr = `${start.getMonth() + 1}.${start.getDate()}-${end.getMonth() + 1}.${end.getDate()}`;
                                    } else if (start) {
                                        dateStr = `${start.getMonth() + 1}.${start.getDate()}`;
                                    }
                                    // 类型颜色
                                    const typeColor = getEventColor(event.type);

                                    return (
                                        <div
                                            key={event.id}
                                            className={`p-4 rounded cursor-pointer border-l-4 hover:opacity-90 ${typeColor.replace("bg-", "bg-opacity-40 bg-").replace("text-", "")}`}
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setShowEventDialog(true);
                                            }}
                                        >
                                            {/* 活动类型：加粗大字号 */}
                                            <div className="flex items-center mb-2">
                                                <span className="font-bold text-lg mr-2">{event.type}</span>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs ${status.className}`}>{status.label}</span>
                                            </div>
                                            {/* 新增：活动日期 */}
                                            <div className="text-xs text-gray-700 mb-1">{dateStr}</div>
                                            <p className="text-xs text-gray-500 truncate">{event.description}</p>
                                        </div>
                                    );
                                })}
                                {events.length === 0 && (
                                    <div className="text-gray-400 text-sm text-center py-8">暂无活动</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 活动详情对话框 */}
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent && React.createElement(getEventIcon(selectedEvent.type), {
                                className: "w-5 h-5 text-purple-600"
                            })}
                            活动详情
                        </DialogTitle>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">{selectedEvent.title}</h3>
                                <Badge className={getEventColor(selectedEvent.type)}>
                                    {selectedEvent.type}
                                </Badge>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4"/>
                                    <span>
                    {format(new Date(selectedEvent.start_date), 'yyyy-MM-dd', {locale: zhCN})}
                                        {selectedEvent.end_date && selectedEvent.end_date !== selectedEvent.start_date &&
                                            ` 至 ${format(new Date(selectedEvent.end_date), 'yyyy-MM-dd', {locale: zhCN})}`
                                        }
                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4"/>
                                    <span>
                    {selectedEvent.participants_count || 0} / {selectedEvent.max_participants || '∞'} 人参与
                  </span>
                                </div>
                            </div>

                            {selectedEvent.description && (
                                <div>
                                    <h4 className="font-medium mb-2">活动描述</h4>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                                    关闭
                                </Button>
                                <Button className="bg-purple-600 hover:bg-purple-700">
                                    报名参加
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}