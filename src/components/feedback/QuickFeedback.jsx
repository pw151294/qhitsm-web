import React, {useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
    MessageSquare,
    Lightbulb,
    FileText,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import {motion} from "framer-motion";

export default function QuickFeedback({onSubmit}) {
    const [feedbackContent, setFeedbackContent] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [currentType, setCurrentType] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const feedbackTypes = [
        {
            type: "内容纠错",
            icon: AlertCircle,
            title: "内容纠错",
            description: "发现内容错误或不准确的地方",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200"
        },
        {
            type: "需求建议",
            icon: Lightbulb,
            title: "需求建议",
            description: "提出新功能需求或改进建议",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200"
        },
        {
            type: "批量反馈",
            icon: FileText,
            title: "批量反馈",
            description: "提交多个问题或大量反馈内容",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200"
        }
    ];

    const handleTypeSelect = (type) => {
        setCurrentType(type);
        setShowDialog(true);
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackContent.trim() || !currentType) return;

        setIsSubmitting(true);
        try {
            // 这里可根据需要设置 priority 字段
            const payload = {
                type: currentType,
                content: feedbackContent,
                priority: "中" // 如有优先级选择，可加此字段
            };
            await fetch("/api/feedback/create", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload)
            });

            setShowDialog(false);
            setFeedbackContent("");
            setCurrentType("");
            setShowSuccess(true);

            setTimeout(() => setShowSuccess(false), 3000);

            if (onSubmit) onSubmit();
        } catch (error) {
            console.error("提交反馈失败:", error);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            {/* 成功提示 */}
            {showSuccess && (
                <motion.div
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -20}}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                >
                    <CheckCircle className="w-5 h-5 text-green-600"/>
                    <span className="text-green-800">反馈提交成功！感谢您的宝贵意见。</span>
                </motion.div>
            )}

            {/* 反馈类型选择 */}
            <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <MessageSquare className="w-6 h-6 text-green-600"/>
                        快速反馈入口
                    </CardTitle>
                    <p className="text-gray-600">选择反馈类型，我们会认真处理您的每一条意见</p>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        {feedbackTypes.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <motion.div
                                    key={item.type}
                                    whileHover={{scale: 1.02}}
                                    whileTap={{scale: 0.98}}
                                >
                                    <Card
                                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${item.bgColor} ${item.borderColor} border-2`}
                                        onClick={() => handleTypeSelect(item.type)}
                                    >
                                        <CardContent className="p-6 text-center">
                                            <div
                                                className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/80 flex items-center justify-center ${item.color}`}>
                                                <IconComponent className="w-8 h-8"/>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600">{item.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 反馈对话框 */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {feedbackTypes.find(t => t.type === currentType)?.icon && (
                                React.createElement(feedbackTypes.find(t => t.type === currentType).icon, {
                                    className: `w-5 h-5 ${feedbackTypes.find(t => t.type === currentType).color}`
                                })
                            )}
                            {currentType}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="feedback-content">请详细描述您的反馈内容</Label>
                            <Textarea
                                id="feedback-content"
                                value={feedbackContent}
                                onChange={(e) => setFeedbackContent(e.target.value)}
                                placeholder={`请详细描述您要反馈的${currentType}...`}
                                rows={8}
                                className="mt-2"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">提示：</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                {currentType === "内容纠错" && (
                                    <>
                                        <li>• 请指明具体的错误位置</li>
                                        <li>• 描述正确的内容应该是什么</li>
                                        <li>• 提供相关的参考资料（如有）</li>
                                    </>
                                )}
                                {currentType === "需求建议" && (
                                    <>
                                        <li>• 说明为什么需要这个功能</li>
                                        <li>• 描述期望的使用场景</li>
                                        <li>• 提供类似功能的参考示例</li>
                                    </>
                                )}
                                {currentType === "批量反馈" && (
                                    <>
                                        <li>• 按问题类型分组描述</li>
                                        <li>• 标明问题的优先级</li>
                                        <li>• 尽量提供问题的截图或示例</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>
                                取消
                            </Button>
                            <Button
                                onClick={handleSubmitFeedback}
                                disabled={!feedbackContent.trim() || isSubmitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? "提交中..." : "提交反馈"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}