
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MessageSquare, 
  BookOpen, 
  MessageCircle, 
  Users, 
  Bell,
  Menu,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
  {
    title: "经验分享与案例学习",
    url: createPageUrl("Experience"),
    icon: BookOpen,
  },
  {
    title: "反馈与建议收集",
    url: createPageUrl("Feedback"),
    icon: MessageCircle,
  },
  {
    title: "社区化运营支撑",
    url: createPageUrl("Community"),
    icon: Users,
  },
];

export default function Layout({ children}) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [notifications] = React.useState(5);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("获取用户信息失败:", error);
    }
  };

  const getLevelBadge = (level) => {
    if (level >= 8) return { text: `L${level} 专家认证`, className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900" };
    if (level >= 5) return { text: `L${level} 高级用户`, className: "bg-gradient-to-r from-blue-400 to-blue-600 text-white" };
    return { text: `L${level} 普通用户`, className: "bg-gradient-to-r from-gray-400 to-gray-600 text-white" };
  };

  const NavigationMenu = ({ isMobile = false }) => (
    <nav className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-6'}`}>
      {navigationItems.map((item) => (
        <Link
          key={item.title}
          to={item.url}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            location.pathname === item.url
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
          } ${isMobile ? 'w-full' : ''}`}
        >
          <item.icon className="w-4 h-4" />
          {item.title}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  互动交流系统
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavigationMenu />
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
                    {notifications}
                  </Badge>
                )}
              </Button>

              {/* User Profile */}
              {user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=3b82f6&color=fff`}
                      alt="用户头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{user.full_name || '用户'}</div>
                    <div className="flex items-center text-xs">
                      <Badge className={getLevelBadge(user.level || 1).className + " text-xs px-2 py-1"}>
                        {getLevelBadge(user.level || 1).text}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                  <div className="text-sm text-gray-500">未登录</div>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="py-6">
                    <NavigationMenu isMobile />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
