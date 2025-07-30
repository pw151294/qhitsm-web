import {useEffect, useState, useRef} from "react";
import {Event, User} from "@/api/entities";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Calendar, MessageCircle, TrendingUp, Trophy} from "lucide-react";

import UserGrowth from "../components/community/UserGrowth";
import Leaderboard from "../components/community/Leaderboard";
import InstantMessaging from "../components/community/InstantMessaging";
import MaintenanceCalendar from "../components/community/MaintenanceCalendar";

export default function Community() {
    const [activeTab, setActiveTab] = useState("growth");
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const loadEventsRef = useRef(null);

    // 动态加载活动信息
    const loadEvents = async (params = {}) => {
        if (typeof loadEventsRef.current === "function") {
            try {
                setIsLoading(true);
                const eventsData = await loadEventsRef.current(params);
                setEvents(eventsData);
            } catch (e) {
                console.error("动态加载活动失败:", e);
            }
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 1）切换到运维日历Tab时加载活动信息
    useEffect(() => {
        if (activeTab === "calendar") {
            loadEvents();
        }
    }, [activeTab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, eventsData] = await Promise.all([
                // 修改此处，假设 User.getList() 才是正确方法
                User.getList ? User.getList() : [],
                Event.list ? Event.list("-start_date") : []
            ]);
            setUsers(usersData);
            setEvents(eventsData);
        } catch (error) {
            console.error("加载社区数据失败:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        社区化运营支撑功能
                    </h1>
                    <p className="text-gray-600 text-lg">构建活跃社区，促进用户交流与成长</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
                        <TabsTrigger value="growth"
                                     className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <TrendingUp className="w-4 h-4"/>
                            用户成长
                        </TabsTrigger>
                        <TabsTrigger value="leaderboard"
                                     className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <Trophy className="w-4 h-4"/>
                            贡献排行榜
                        </TabsTrigger>
                        <TabsTrigger value="messaging"
                                     className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <MessageCircle className="w-4 h-4"/>
                            即时通讯
                        </TabsTrigger>
                        <TabsTrigger value="calendar"
                                     className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <Calendar className="w-4 h-4"/>
                            运维日历
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="growth" className="mt-0">
                            <UserGrowth users={users} isLoading={isLoading}/>
                        </TabsContent>

                        <TabsContent value="leaderboard" className="mt-0">
                            <Leaderboard users={users} isLoading={isLoading}/>
                        </TabsContent>

                        <TabsContent value="messaging" className="mt-0">
                            <InstantMessaging/>
                        </TabsContent>

                        <TabsContent value="calendar" className="mt-0">
                            <MaintenanceCalendar
                                events={events}
                                isLoading={isLoading}
                                // 2）将 loadEvents 作为 onRefresh 传递，供日历内部调用
                                onRefresh={loadEvents}
                                onLoadEvents={fn => (loadEventsRef.current = fn)}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}