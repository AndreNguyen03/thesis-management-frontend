/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Sparkles, FileCheck, Search } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function AITools({ formData, setFormData }: any) {
    const [aiLoading, setAiLoading] = useState<string | null>(null)
    const [aiDialog, setAiDialog] = useState<{
        type: 'optimize' | 'skills' | 'duplicate' | null
        data: any
    }>({ type: null, data: null })

    // ======== 1️⃣ Tối ưu mô tả ========
    const handleAIOptimizeDescription = async () => {
        if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })
        setAiLoading('optimize')
        try {
            const res = await fetch('/api/ai/optimize-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || ''
                })
            })
            const data = await res.json()
            setAiDialog({
                type: 'optimize',
                data: {
                    original: formData.description || '(Chưa có mô tả)',
                    optimized: data.optimizedDescription
                }
            })
        } catch {
            toast({ title: 'Lỗi khi tối ưu mô tả', variant: 'destructive' })
        } finally {
            setAiLoading(null)
        }
    }

    // ======== 2️⃣ Gợi ý kỹ năng ========
    const handleAISuggestSkills = async () => {
        if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })
        setAiLoading('skills')
        try {
            const res = await fetch('/api/ai/suggest-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || ''
                })
            })
            const data = await res.json()
            setAiDialog({ type: 'skills', data: data.skills })
        } catch {
            toast({ title: 'Lỗi khi gợi ý kỹ năng', variant: 'destructive' })
        } finally {
            setAiLoading(null)
        }
    }

    // ======== 3️⃣ Kiểm tra trùng lặp ========
    const handleAICheckDuplicate = async () => {
        if (!formData.title?.trim()) return toast({ title: 'Vui lòng nhập tiêu đề đề tài' })
        setAiLoading('duplicate')
        try {
            const res = await fetch('/api/ai/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || ''
                })
            })
            const data = await res.json()
            setAiDialog({ type: 'duplicate', data: data.similarTopics || [] })
        } catch {
            toast({ title: 'Lỗi khi kiểm tra trùng lặp', variant: 'destructive' })
        } finally {
            setAiLoading(null)
        }
    }

    // ======== UI phần nút công cụ AI ========
    return (
        <>
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" /> Công cụ hỗ trợ AI
                </h3>
                <p className="text-sm text-muted-foreground">
                    Giúp bạn hoàn thiện đề tài nhanh và chính xác hơn
                </p>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAIOptimizeDescription}
                    disabled={!!aiLoading}
                >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {aiLoading === 'optimize' ? 'Đang xử lý...' : 'Tối ưu mô tả đề tài'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAISuggestSkills}
                    disabled={!!aiLoading}
                >
                    <FileCheck className="mr-2 h-4 w-4" />
                    {aiLoading === 'skills' ? 'Đang xử lý...' : 'Gợi ý yêu cầu kỹ năng'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleAICheckDuplicate}
                    disabled={!!aiLoading}
                >
                    <Search className="mr-2 h-4 w-4" />
                    {aiLoading === 'duplicate' ? 'Đang kiểm tra...' : 'Kiểm tra trùng lặp'}
                </Button>
            </div>

            {/* ======== Dialog kết quả AI ======== */}
            <Dialog open={!!aiDialog.type} onOpenChange={() => setAiDialog({ type: null, data: null })}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {aiDialog.type === 'optimize'
                                ? 'So sánh mô tả đề tài'
                                : aiDialog.type === 'skills'
                                ? 'Kỹ năng được AI gợi ý'
                                : 'Đề tài tương tự'}
                        </DialogTitle>
                        <DialogDescription>
                            {aiDialog.type === 'optimize' && (
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium mb-1">Mô tả ban đầu:</p>
                                        <div className="p-2 border rounded bg-muted/40 whitespace-pre-line">
                                            {aiDialog.data.original}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium mb-1 text-primary">Mô tả đã tối ưu:</p>
                                        <div className="p-2 border rounded bg-primary/5 whitespace-pre-line">
                                            {aiDialog.data.optimized}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {aiDialog.type === 'skills' && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {aiDialog.data.length > 0 ? (
                                        aiDialog.data.map((skill: string) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 bg-primary/10 rounded-full text-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p>Không có kỹ năng nào được gợi ý</p>
                                    )}
                                </div>
                            )}

                            {aiDialog.type === 'duplicate' && (
                                <div className="space-y-2 mt-2">
                                    {aiDialog.data.length > 0 ? (
                                        aiDialog.data.map((t: any) => (
                                            <div
                                                key={t._id}
                                                className="p-2 border rounded bg-muted/40"
                                            >
                                                <p className="font-medium">{t.title}</p>
                                                {t.department && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {t.department}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p>Không phát hiện đề tài trùng lặp</p>
                                    )}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        {aiDialog.type !== 'duplicate' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => setAiDialog({ type: null, data: null })}
                                >
                                    Bỏ
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (aiDialog.type === 'optimize')
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                description: aiDialog.data.optimized
                                            }))
                                        else if (aiDialog.type === 'skills')
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                requirements: aiDialog.data
                                            }))
                                        setAiDialog({ type: null, data: null })
                                    }}
                                >
                                    Giữ
                                </Button>
                            </>
                        )}

                        {aiDialog.type === 'duplicate' && (
                            <Button onClick={() => setAiDialog({ type: null, data: null })}>
                                Đã hiểu
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
