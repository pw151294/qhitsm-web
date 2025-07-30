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

    const getCategoryColor = (category) => {
        const colors = {
            "新手问答": "bg-green-100 text-green-700 border-green-200",
            "技术攻坚": "bg-red-100 text-red-700 border-red-200",
            "行业动态": "bg-blue-100 text-blue-700 border-blue-200"
        };
        return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
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

    return (
        <div className="space-y-6">
            {/* 分类导航 */}
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">讨论分类</CardTitle>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
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
                                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                            取消
                                        </Button>
                                        <Button onClick={handleCreatePost}>
                                            发布帖子
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 flex-wrap">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={category === cat ? "default" : "outline"}
                                onClick={() => handleCategoryChange(cat)}
                                className={category === cat ? "bg-blue-600" : ""}
                            >
                                {cat}
                            </Button>
                        ))}
                        <Input
                            className="ml-4 w-48"
                            placeholder="搜索关键词"
                            value={keyword}
                            onChange={handleKeywordChange}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 精华轮播 */}
            {featuredPosts.length > 0 && (
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
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
            <Card className="bg-white/80 backdrop-blur-sm">
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
                                    <div className="flex-shrink-0">
                                        {post.is_pinned && (
                                            <div
                                                className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Pin className="w-6 h-6 text-red-600"/>
                                            </div>
                                        )}
                                        {post.reward_points > 0 && !post.is_pinned && (
                                            <div
                                                className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <Award className="w-6 h-6 text-yellow-600"/>
                                            </div>
                                        )}
                                        {!post.is_pinned && post.reward_points === 0 && (
                                            <div
                                                className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MessageCircle className="w-6 h-6 text-blue-600"/>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline"
                                                           className={getCategoryColor(post.category)}>
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
                                                <Button variant="outline" size="sm">
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
        </div>
    );
}