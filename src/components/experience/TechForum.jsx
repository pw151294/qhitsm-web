import {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Award, Calendar, Eye, MessageCircle, Pin, Plus, Star, User} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";

export default function TechForum({
                                      posts,
                                      isLoading,
                                      onCategoryChange,
                                      category = "全部",
                                      onKeywordChange,
                                      keyword = "",
                                      onRefresh
                                  }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newPost, setNewPost] = useState({
        title: "",
        content: "",
        category: "",
        reward_points: 0
    });

    const categories = ["全部", "新手问答", "技术攻坚", "行业动态"];

    // 关键词输入
    const handleKeywordChange = (e) => {
        if (onKeywordChange) onKeywordChange(e.target.value);
    };

    // 分类切换
    const handleCategoryChange = (cat) => {
        if (onCategoryChange) onCategoryChange(cat);
    };

    // 精华推荐
    const featuredPosts = posts.filter(post => post.is_featured).slice(0, 3);

    const handleCreatePost = async () => {
        try {
            const res = await fetch('/api/forum/posts/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newPost.title,
                    content: newPost.content,
                    category: newPost.category,
                    reward_points: newPost.reward_points
                })
            });
            if (!res.ok) throw new Error('网络请求失败');
            // 可根据需要处理返回数据
            setShowCreateDialog(false);
            setNewPost({
                title: "",
                content: "",
                category: "",
                reward_points: 0
            });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("创建帖子失败:", error);
        }
    };

    // 帖子类型标签样式，参考案例库页面
    const getCategoryColor = () => {
        return "bg-blue-50 text-blue-700 border-blue-200";
    };

    // 新增：回复弹窗相关状态
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [replyPostId, setReplyPostId] = useState(null);
    const [replyLoading, setReplyLoading] = useState(false);

    // 新增：打开回复弹窗
    const openReplyDialog = (postId) => {
        setReplyPostId(postId);
        setReplyContent("");
        setReplyDialogOpen(true);
    };

    // 新增：提交回复
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        setReplyLoading(true);
        try {
            const res = await fetch(`/api/forum/posts/${replyPostId}/replies`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    content: replyContent,
                    parent_id: null,
                    mentioned_users: []
                })
            });
            if (!res.ok) throw new Error("回复失败");
            setReplyDialogOpen(false);
            setReplyContent("");
            setReplyPostId(null);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error("回复失败", e);
        } finally {
            setReplyLoading(false);
        }
    };

    // 帖子详情弹窗相关状态
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [postDetail, setPostDetail] = useState(null);

    // 查看详情处理函数
    const handleShowDetail = async (postId) => {
        setShowDetailDialog(true);
        setDetailLoading(true);
        try {
            const resp = await fetch(`/api/forum/posts/${postId}`);
            const result = await resp.json();
            if (result.code === 200 && result.data) {
                setPostDetail(result.data);
            } else {
                setPostDetail(null);
            }
        } catch (e) {
            setPostDetail(null);
        }
        setDetailLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* 分类导航 */}
            <div className="flex gap-4 flex-wrap items-center">
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        variant={category === cat ? "default" : "outline"}
                        onClick={() => handleCategoryChange(cat)}
                        className={`${category === cat ? "bg-blue-600" : ""} rounded-none`}
                    >
                        {cat}
                    </Button>
                ))}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 rounded-none">
                            <Plus className="w-4 h-4 mr-2"/>
                            发布帖子
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>发布新帖子</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>帖子标题</Label>
                                <Input
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                                    placeholder="输入帖子标题"
                                />
                            </div>
                            <div>
                                <Label>分类</Label>
                                <Select
                                    value={newPost.category}
                                    onValueChange={(value) => setNewPost({...newPost, category: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择分类"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="新手问答">新手问答</SelectItem>
                                        <SelectItem value="技术攻坚">技术攻坚</SelectItem>
                                        <SelectItem value="行业动态">行业动态</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>悬赏积分（可选）</Label>
                                <Input
                                    type="number"
                                    value={newPost.reward_points}
                                    onChange={(e) => setNewPost({
                                        ...newPost,
                                        reward_points: parseInt(e.target.value) || 0
                                    })}
                                    placeholder="输入悬赏积分"
                                />
                            </div>
                            <div>
                                <Label>帖子内容</Label>
                                <Textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                                    placeholder="详细描述你的问题或想法"
                                    rows={6}
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
                                    onClick={handleCreatePost}
                                    className="bg-[#1f69ff] hover:bg-[#1f69ff]"
                                >
                                    发布帖子
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Input
                    className="ml-4 w-48 rounded-none"
                    placeholder="搜索关键词"
                    value={keyword}
                    onChange={handleKeywordChange}
                />
            </div>

            {/* 精华轮播 */}
            {featuredPosts.length > 0 && (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg text-yellow-800">
                            <Star className="w-5 h-5"/>
                            精华推荐
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {featuredPosts.map((post) => (
                                <div key={post.id} className="bg-white/80 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium line-clamp-2">{post.title}</h4>
                                        <Badge className="bg-yellow-100 text-yellow-800 ml-2">
                                            <Star className="w-3 h-3"/>
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3"/>
                                            {post.created_by?.split('@')[0] || '匿名用户'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-3 h-3"/>
                                            {post.views_count || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 讨论区列表 */}
            <Card className="bg-white/80 backdrop-blur-sm rounded-none">
                <CardHeader>
                    <CardTitle className="text-lg">讨论列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center space-x-4 p-4 border-b">
                                    <Skeleton className="h-12 w-12 rounded"/>
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4"/>
                                        <Skeleton className="h-3 w-1/2"/>
                                    </div>
                                    <div className="flex gap-4">
                                        <Skeleton className="h-3 w-16"/>
                                        <Skeleton className="h-3 w-16"/>
                                    </div>
                                </div>
                            ))
                        ) : (
                            posts.map((post) => (
                                <div key={post.id}
                                     className="flex items-start space-x-4 p-4 border-b hover:bg-gray-50/50 transition-colors">
                                    {/* 删除左侧图标 */}
                                    {/* <div className="flex-shrink-0">
                                        ...图标相关代码...
                                    </div> */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline"
                                                           className={getCategoryColor()}>
                                                        {post.category}
                                                    </Badge>
                                                    {post.reward_points > 0 && (
                                                        <Badge className="bg-yellow-100 text-yellow-800">
                                                            <Award className="w-3 h-3 mr-1"/>
                                                            {post.reward_points}积分
                                                        </Badge>
                                                    )}
                                                    {post.is_featured && (
                                                        <Badge className="bg-orange-100 text-orange-800">
                                                            <Star className="w-3 h-3 mr-1"/>
                                                            精华
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3"/>
                                                        {post.created_by?.split('@')[0] || '匿名用户'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3"/>
                                                        {format(new Date(post.created_date), 'MM-dd HH:mm', {locale: zhCN})}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
                                                <div className="flex items-center gap-1">
                                                    <Eye className="w-4 h-4"/>
                                                    {post.views_count || 0}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle
                                                        className="w-4 h-4 cursor-pointer"
                                                        onClick={() => openReplyDialog(post.id)}
                                                    />
                                                    {post.replies_count || 0}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleShowDetail(post.id)}
                                                >
                                                    查看详情
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
            {/* 新增：回复弹窗 */}
            <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>回复帖子</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Textarea
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            placeholder="请输入你的回复内容"
                            rows={5}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>
                                取消
                            </Button>
                            <Button onClick={handleReplySubmit} disabled={replyLoading || !replyContent.trim()}>
                                {replyLoading ? "提交中..." : "提交回复"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* 新增：帖子详情弹窗 */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-3xl w-full bg-gradient-to-br from-blue-50 to-white border-blue-200 rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                            {postDetail?.is_pinned && (
                                <Pin className="w-5 h-5 text-red-500"/>
                            )}
                            {postDetail?.is_featured && (
                                <Star className="w-5 h-5 text-orange-400"/>
                            )}
                            {postDetail?.title || "帖子详情"}
                        </DialogTitle>
                    </DialogHeader>
                    {detailLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-2/3"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-5/6"/>
                        </div>
                    ) : postDetail ? (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                <Badge variant="outline" className={getCategoryColor()}>
                                    {postDetail.category}
                                </Badge>
                                {postDetail.reward_points > 0 && (
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        <Award className="w-3 h-3 mr-1"/>
                                        {postDetail.reward_points}积分
                                    </Badge>
                                )}
                                {postDetail.is_featured && (
                                    <Badge className="bg-orange-100 text-orange-800">
                                        <Star className="w-3 h-3 mr-1"/>
                                        精华
                                    </Badge>
                                )}
                                <span className="flex items-center gap-1 text-gray-500 text-xs ml-auto">
                                    <User className="w-4 h-4"/>
                                    {postDetail.author_info?.full_name || postDetail.created_by?.split('@')[0] || "匿名用户"}
                                    <span className="ml-2 flex items-center gap-1">
                                        <Calendar className="w-4 h-4"/>
                                        {format(new Date(postDetail.created_date), 'yyyy-MM-dd HH:mm', {locale: zhCN})}
                                    </span>
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                {postDetail.author_info?.avatar_url && (
                                    <img
                                        src={postDetail.author_info.avatar_url}
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full border"
                                    />
                                )}
                                <div>
                                    <div className="font-semibold text-gray-800">{postDetail.author_info?.full_name}</div>
                                    <div className="text-xs text-blue-600">{postDetail.author_info?.certification}</div>
                                    <div className="text-xs text-gray-400">Lv.{postDetail.author_info?.level}</div>
                                </div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1">内容</div>
                                <div className="bg-gray-50 p-3 text-gray-800 rounded whitespace-pre-line">{postDetail.content}</div>
                            </div>
                            <div className="flex gap-6 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Eye className="w-4 h-4"/>{postDetail.views_count || 0} 浏览</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4"/>{postDetail.likes_count || 0} 点赞</span>
                                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4"/>{postDetail.replies_count || 0} 回复</span>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-700 mb-1 mt-4">回复</div>
                                {postDetail.replies && postDetail.replies.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {postDetail.replies.map(reply => (
                                            <div key={reply.id} className="bg-blue-50 rounded p-2 text-gray-700 flex items-start gap-2">
                                                <User className="w-4 h-4 text-blue-400 mt-1"/>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1">回复ID: {reply.id}</div>
                                                    <div className="text-sm">{reply.content}</div>
                                                    <div className="text-xs text-gray-400 mt-1">点赞数：{reply.likes_count}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-gray-400 text-sm">暂无回复</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400">未能加载帖子详情</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}