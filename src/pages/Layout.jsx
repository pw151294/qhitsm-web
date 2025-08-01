import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MessageSquare,
  Bell,
  Menu,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

// 新的导航结构，经验分享与案例学习和反馈与建议收集均有子菜单
const navigationItems = [
  {
    title: "经验分享与案例学习",
    url: createPageUrl("Experience"),
    children: [
      {
        title: "案例库",
        url: "/Experience?tab=cases",
        tab: "cases",
      },
      {
        title: "技术论坛",
        url: "/Experience?tab=forum",
        tab: "forum",
      },
    ],
  },
  {
    title: "反馈与建议收集",
    url: createPageUrl("Feedback"),
    children: [
      {
        title: "反馈中心",
        url: "/Feedback?tab=stats",
        tab: "stats",
      },
      {
        title: "反馈管理",
        url: "/Feedback?tab=management",
        tab: "management",
      },
    ],
  },
  {
    title: "社区化运营支撑",
    url: createPageUrl("Community"),
    children: [
      {
        title: "用户成长",
        url: "/Community?tab=growth",
        tab: "growth",
      },
    ],
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [notifications] = React.useState(5);

  // 折叠状态：经验分享菜单
  const [expOpen, setExpOpen] = useState(() =>
    location.pathname.startsWith("/Experience")
  );
  // 折叠状态：反馈菜单
  const [fbOpen, setFbOpen] = useState(() =>
    location.pathname.startsWith("/Feedback")
  );
  // 折叠状态：社区化运营支撑菜单
  const [communityOpen, setCommunityOpen] = useState(() =>
    location.pathname.startsWith("/Community")
  );
  // 移动端折叠
  const [expOpenMobile, setExpOpenMobile] = useState(() =>
    location.pathname.startsWith("/Experience")
  );
  const [fbOpenMobile, setFbOpenMobile] = useState(() =>
    location.pathname.startsWith("/Feedback")
  );
  const [communityOpenMobile, setCommunityOpenMobile] = useState(() =>
    location.pathname.startsWith("/Community")
  );

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

  // 当前是否在经验分享页面及其子页面
  const isExperienceActive = useMemo(
    () => location.pathname === "/Experience" || location.pathname === "/" || location.pathname.startsWith("/Experience"),
    [location.pathname]
  );
  // 当前是否在反馈页面及其子页面
  const isFeedbackActive = useMemo(
    () => location.pathname === "/Feedback" || location.pathname.startsWith("/Feedback"),
    [location.pathname]
  );
  // 当前是否在社区化运营支撑页面及其子页面
  const isCommunityActive = useMemo(
    () => location.pathname === "/Community" || location.pathname.startsWith("/Community"),
    [location.pathname]
  );
  // 当前tab参数
  const currentTab = useMemo(() => {
    // 只在经验分享页面下才解析tab
    if (!isExperienceActive) return "";
    const m = location.search.match(/tab=(\w+)/);
    return m ? m[1] : "cases";
  }, [location.search, isExperienceActive]);
  // 当前feedback tab参数
  const currentFeedbackTab = useMemo(() => {
    // 只在反馈页面下才解析tab
    if (!isFeedbackActive) return "";
    const m = location.search.match(/tab=(\w+)/);
    return m ? m[1] : "quick";
  }, [location.search, isFeedbackActive]);
  // 当前community tab参数
  const currentCommunityTab = useMemo(() => {
    // 只在社区化运营支撑页面下才解析tab
    if (!isCommunityActive) return "";
    const m = location.search.match(/tab=(\w+)/);
    return m ? m[1] : "growth";
  }, [location.search, isCommunityActive]);

  // 左侧纵向导航
  const NavigationMenu = ({ isMobile = false, onClickNav }) => (
    <nav className={`flex flex-col space-y-2`}>
      {/* 经验分享与案例学习（带折叠） */}
      <div>
        <button
          className={`group flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
            ${
              isExperienceActive
                ? 'text-gray-900'
                : 'text-gray-700'
            }`}
          style={{
            fontWeight: 400,
            fontSize: "1rem"
          }}
          // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
          onClick={() => isMobile ? setExpOpenMobile(v => !v) : setExpOpen(v => !v)}
        >
          <span className="truncate">经验分享与案例学习</span>
          {(isMobile ? expOpenMobile : expOpen)
            ? <ChevronDown className="ml-auto w-4 h-4" />
            : <ChevronRight className="ml-auto w-4 h-4" />}
        </button>
        <div
          className={`transition-all overflow-hidden
            ${isMobile
              ? expOpenMobile ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              : expOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
            }`}
          style={{ transition: "all 0.2s" }}
        >
          {navigationItems[0].children.map((child) => (
            <Link
              key={child.title}
              to={child.url}
              onClick={onClickNav}
              className={`block py-2 px-4 w-full rounded-lg transition-all duration-200
                ${isExperienceActive && currentTab === child.tab
                  ? 'bg-[color:var(--blue-6)] text-white'
                  : 'text-gray-600'
                }`}
              style={{
                fontWeight: 400,
                fontSize: "1rem",
                textAlign: "left",
                paddingLeft: "2.5rem"
              }}
              // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
            >
              {child.title}
            </Link>
          ))}
        </div>
      </div>
      {/* 反馈与建议收集（带折叠） */}
      <div>
        <button
          className={`group flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
            ${
              isFeedbackActive
                ? 'text-gray-900'
                : 'text-gray-700'
            }`}
          style={{
            fontWeight: 400,
            fontSize: "1rem"
          }}
          // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
          onClick={() => isMobile ? setFbOpenMobile(v => !v) : setFbOpen(v => !v)}
        >
          <span className="truncate">反馈与建议收集</span>
          {(isMobile ? fbOpenMobile : fbOpen)
            ? <ChevronDown className="ml-auto w-4 h-4" />
            : <ChevronRight className="ml-auto w-4 h-4" />}
        </button>
        <div
          className={`transition-all overflow-hidden
            ${isMobile
              ? fbOpenMobile ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              : fbOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          style={{ transition: "all 0.2s" }}
        >
          {navigationItems[1].children.map((child) => (
            <Link
              key={child.title}
              to={child.url}
              onClick={onClickNav}
              className={`block py-2 px-4 w-full rounded-lg transition-all duration-200
                ${isFeedbackActive && currentFeedbackTab === child.tab
                  ? 'bg-[color:var(--blue-6)] text-white'
                  : 'text-gray-600'
                }`}
              style={{
                fontWeight: 400,
                fontSize: "1rem",
                textAlign: "left",
                paddingLeft: "2.5rem"
              }}
              // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
            >
              {child.title}
            </Link>
          ))}
        </div>
      </div>
      {/* 社区化运营支撑（带折叠） */}
      <div>
        <button
          className={`group flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200
            ${
              isCommunityActive
                ? 'text-gray-900'
                : 'text-gray-700'
            }`}
          style={{
            fontWeight: 400,
            fontSize: "1rem"
          }}
          // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
          onClick={() => isMobile ? setCommunityOpenMobile(v => !v) : setCommunityOpen(v => !v)}
        >
          <span className="truncate">社区化运营支撑</span>
          {(isMobile ? communityOpenMobile : communityOpen)
            ? <ChevronDown className="ml-auto w-4 h-4" />
            : <ChevronRight className="ml-auto w-4 h-4" />}
        </button>
        <div
          className={`transition-all overflow-hidden
            ${isMobile
              ? communityOpenMobile ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
              : communityOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
            }`}
          style={{ transition: "all 0.2s" }}
        >
          {navigationItems[2].children.map((child) => (
            <Link
              key={child.title}
              to={child.url}
              onClick={onClickNav}
              className={`block py-2 px-4 w-full rounded-lg transition-all duration-200
                ${isCommunityActive && currentCommunityTab === child.tab
                  ? 'bg-[color:var(--blue-6)] text-white'
                  : 'text-gray-600'
                }`}
              style={{
                fontWeight: 400,
                fontSize: "1rem",
                textAlign: "left",
                paddingLeft: "2.5rem"
              }}
              // 移除 onMouseEnter/onMouseLeave 以取消 hover 背景
            >
              {child.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex"
      style={{
        "--blue-1": "#ebf5ff",
        "--blue-3": "#99c5ff",
        "--blue-6": "#1f69ff",
        "--blue-7": "#0f4cd9",
        "--text-regular": "#595959"
      }}
    >
      {/* 左侧侧边栏 */}
      <aside className="hidden lg:flex flex-col w-64 bg-[color:var(--blue-3)]/90 backdrop-blur-sm border-r shadow-sm min-h-screen">
        {/* Logo区域 */}
        <div className="flex items-center gap-3 px-6 py-6 border-b">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            互动交流系统
          </span>
        </div>
        {/* 导航菜单 */}
        <div className="flex-1 px-2 py-6">
          <NavigationMenu />
        </div>
        {/* 用户信息 */}
        <div className="px-6 py-4 border-t flex items-center gap-3">
          {user ? (
            <>
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=3b82f6&color=fff`}
                  alt="用户头像"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">{user.full_name || '用户'}</div>
                <Badge className={getLevelBadge(user.level || 1).className + " text-xs px-2 py-1"}>
                  {getLevelBadge(user.level || 1).text}
                </Badge>
              </div>
            </>
          ) : (
            <>
              <UserIcon className="w-8 h-8 text-gray-400" />
              <div className="text-sm text-gray-500">未登录</div>
            </>
          )}
        </div>
      </aside>

      {/* 移动端顶部栏 */}
      <div className="lg:hidden w-full">
        <header
          className="bg-[color:var(--blue-3)]/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50"
          style={{
            "--blue-1": "#ebf5ff",
            "--blue-3": "#99c5ff",
            "--blue-6": "#1f69ff",
            "--blue-7": "#0f4cd9"
          }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                互动交流系统
              </span>
            </div>
            {/* 通知 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
                  {notifications}
                </Badge>
              )}
            </Button>
            {/* 侧边栏抽屉 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 px-6 py-6 border-b">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                      互动交流系统
                    </span>
                  </div>
                  <div className="flex-1 px-2 py-6">
                    <NavigationMenu isMobile onClickNav={() => {}} />
                  </div>
                  <div className="px-6 py-4 border-t flex items-center gap-3">
                    {user ? (
                      <>
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || '用户')}&background=3b82f6&color=fff`}
                            alt="用户头像"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">{user.full_name || '用户'}</div>
                          <Badge className={getLevelBadge(user.level || 1).className + " text-xs px-2 py-1"}>
                            {getLevelBadge(user.level || 1).text}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-8 h-8 text-gray-400" />
                        <div className="text-sm text-gray-500">未登录</div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
