import {

AlertDialog,
AlertDialogAction,
AlertDialogCancel,
AlertDialogContent,
AlertDialogDescription,
AlertDialogFooter,
AlertDialogHeader,
AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmModalProps {
open: boolean;
onOpenChange: (open: boolean) => void;
onConfirm: () => void;
title?: string;
description?: string;
isLoading?: boolean;
}

export function DeleteConfirmModal({
open,
onOpenChange,
onConfirm,
title = "Xác nhận xóa",
description = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
isLoading = false,
}: DeleteConfirmModalProps) {
return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    {isLoading ? "Đang xóa..." : "Xóa"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
}