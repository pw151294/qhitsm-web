import React, { useEffect, useRef } from "react";
import UserGrowth from "../components/community/UserGrowth";
import MaintenanceCalendar from "../components/community/MaintenanceCalendar";
import { Event, User } from "@/api/entities";

export default function Community() {
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

    // 只保留成长中心内容，无tab切换
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
                {/* 只显示社区化运营支撑页头 */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
                        社区化运营支撑
                    </h1>
                </div>
                <div className="mt-6">
                    <UserGrowth users={users} isLoading={isLoading} />
                </div>
                {/* 运维日历始终在成长中心内容下方展示 */}
                <div className="mt-10">
                    <MaintenanceCalendar
                        events={events}
                        isLoading={isLoading}
                        onRefresh={loadEvents}
                        onLoadEvents={fn => (loadEventsRef.current = fn)}
                    />
                </div>
            </div>
        </div>
    );
}