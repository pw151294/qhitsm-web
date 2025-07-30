import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
    MessageCircle,
    Send,
    Search,
    AtSign,
    Hash,
    User
} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";

export default function InstantMessaging() {
    const [activeChat, setActiveChat] = useState("general");
    const [message, setMessage] = useState("");
    const [currentMessages, setCurrentMessages] = useState([]) // 初始值改为数组

    // 模拟数据
    const chatRooms = [
        {id: "general", name: "综合讨论", type: "group", members: 156},
        {id: "tech-support", name: "技术支持", type: "group", members: 89},
        {id: "announcements", name: "公告通知", type: "group", members: 234},
        {id: "newbie", name: "新手问答", type: "group", members: 67}
    ];

    const privateChats = [
        {
            id: "user1",
            name: "技术专家-张三",
            avatar: "https://ui-avatars.com/api/?name=张三&background=3b82f6&color=fff",
            online: true
        },
        {
            id: "user2",
            name: "运维工程师-李四",
            avatar: "https://ui-avatars.com/api/?name=李四&background=10b981&color=fff",
            online: false
        },
        {
            id: "user3",
            name: "系统管理员-王五",
            avatar: "https://ui-avatars.com/api/?name=王五&background=f59e0b&color=fff",
            online: true
        }
    ];


    // 动态加载群组消息
    React.useEffect(() => {
        loadMessages();
    }, [activeChat]); // 依赖activeChat，切换时重新加载

    const loadMessages = async () => {
        try {
            const res = await fetch(`/api/chatMessages`);
            const resp = await res.json();
            if (resp.code !== 200) throw new Error(resp.message || "获取消息失败");
            // 确保currentMessages为数组
            setCurrentMessages(Array.isArray(resp.data[activeChat]) ? resp.data[activeChat] : []);
            console.log("消息列表：", currentMessages);
        } catch (error) {
            console.error("获取消息失败:", error);
            setCurrentMessages([]); // 失败时也设为空数组，避免map报错
        }
    }

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        // 仅支持群组发送
        const groupTypes = ["general", "tech-support", "announcements", "newbie"];
        if (!groupTypes.includes(activeChat)) {
            setMessage("");
            return;
        }

        try {
            await fetch(`/api/chatMessages/rooms/${activeChat}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    content: message,
                    type: "text",
                    mentioned_users: []
                })
            });
            setMessage("");
            loadMessages(); // 发送成功后刷新消息
        } catch (error) {
            console.error("发送消息失败:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="h-[600px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <div className="flex h-full">
                {/* 左侧聊天列表 */}
                <div className="w-80 border-r bg-gray-50/50">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-purple-600"/>
                            即时通讯
                        </h3>
                    </div>

                    <Tabs defaultValue="groups" className="h-full">
                        <TabsList className="grid w-full grid-cols-2 m-2">
                            <TabsTrigger value="groups" className="flex items-center gap-1">
                                <Hash className="w-4 h-4"/>
                                群组
                            </TabsTrigger>
                            <TabsTrigger value="private" className="flex items-center gap-1">
                                <User className="w-4 h-4"/>
                                私信
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="groups" className="mt-0 h-full">
                            <ScrollArea className="h-full p-2">
                                <div className="space-y-1">
                                    {chatRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            onClick={() => setActiveChat(room.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                activeChat === room.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <div
                                                className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Hash className="w-5 h-5 text-purple-600"/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{room.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">{room.members} 成员</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="private" className="mt-0 h-full">
                            <ScrollArea className="h-full p-2">
                                <div className="space-y-1">
                                    {privateChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => setActiveChat(chat.id)}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                activeChat === chat.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full overflow-hidden">
                                                    <img src={chat.avatar} alt={chat.name}
                                                         className="w-full h-full object-cover"/>
                                                </div>
                                                <div
                                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                                        chat.online ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}/>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{chat.name}</div>
                                                <p className="text-sm text-gray-500">
                                                    {chat.online ? '在线' : '离线'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* 右侧聊天内容 */}
                <div className="flex-1 flex flex-col">
                    {/* 聊天头部 */}
                    <div className="p-4 border-b bg-white/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                    {activeChat.startsWith("user") ? <User className="w-5 h-5 text-purple-600"/> :
                                        <Hash className="w-5 h-5 text-purple-600"/>}
                                </div>
                                <div>
                                    <h4 className="font-semibold">
                                        {chatRooms.find(r => r.id === activeChat)?.name ||
                                            privateChats.find(c => c.id === activeChat)?.name || '聊天室'}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                        {chatRooms.find(r => r.id === activeChat) ?
                                            `${chatRooms.find(r => r.id === activeChat).members} 成员` :
                                            '私人对话'}
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                <Search className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>

                    {/* 消息列表 */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {currentMessages.map((msg) => (
                                <div key={msg.id}
                                     className={`flex gap-3 ${msg.user === '当前用户' ? 'flex-row-reverse' : ''}`}>
                                    {msg.type !== 'system' && (
                                        <div
                                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                            {msg.user[0]}
                                        </div>
                                    )}
                                    <div className={`flex-1 max-w-xs ${msg.user === '当前用户' ? 'text-right' : ''}`}>
                                        {msg.type === 'system' ? (
                                            <div
                                                className="text-center text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <>
                                                <div className={`inline-block p-3 rounded-lg ${
                                                    msg.user === '当前用户'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {msg.user !== '当前用户' && `${msg.user} • `}
                                                    {format(msg.time, 'HH:mm', {locale: zhCN})}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* 消息输入 */}
                    <div className="p-4 border-t bg-white/50">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                                    className="pr-12"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                >
                                    <AtSign className="w-4 h-4"/>
                                </Button>
                            </div>
                            <Button onClick={handleSendMessage} disabled={!message.trim()}>
                                <Send className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};