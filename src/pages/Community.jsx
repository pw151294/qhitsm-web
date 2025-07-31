import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserGrowth from "../components/community/UserGrowth";
import Leaderboard from "../components/community/Leaderboard";
import InstantMessaging from "../components/community/InstantMessaging";
import MaintenanceCalendar from "../components/community/MaintenanceCalendar";
import { Event, User } from "@/api/entities";

export default function Community() {
    const location = useLocation();
    const navigate = useNavigate();

    // 解析tab参数
    const tab = (() => {
        const m = location.search.match(/tab=(\w+)/);
        return m ? m[1] : "growth";
    })();

    const [users, setUsers] = React.useState([]);
    const [events, setEvents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
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
        // eslint-disable-next-line
    }, []);

    // 切换到运维日历Tab时加载活动信息
    useEffect(() => {
        if (tab === "calendar") {
            loadEvents();
        }
        // eslint-disable-next-line
    }, [tab]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, eventsData] = await Promise.all([
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

    // 页面内容
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        社区化运营支撑功能
                    </h1>
                    <p className="text-gray-600 text-lg">构建活跃社区，促进用户交流与成长</p>
                </div>
                <div className="mt-6">
                    {tab === "growth" && (
                        <UserGrowth users={users} isLoading={isLoading} />
                    )}
                    {tab === "leaderboard" && (
                        <Leaderboard users={users} isLoading={isLoading} />
                    )}
                    {tab === "messaging" && (
                        <InstantMessaging />
                    )}
                    {tab === "calendar" && (
                        <MaintenanceCalendar
                            events={events}
                            isLoading={isLoading}
                            onRefresh={loadEvents}
                            onLoadEvents={fn => (loadEventsRef.current = fn)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}