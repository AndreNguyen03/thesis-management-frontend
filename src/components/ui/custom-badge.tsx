import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ReactNode } from 'react'

interface Option {
    label: string
    value: string | number | boolean
}

interface CustomBadgeProps {
    value: string | number | boolean
    options: Option[]
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    children?: ReactNode
    className?: string
    role?: string
    'aria-label'?: string
}

/**
 * CustomBadge hiển thị nhãn trạng thái hoặc giá trị có màu sắc và nhãn tương ứng.
 * - `value`: giá trị hiện tại (true / false / string / number)
 * - `options`: danh sách nhãn ứng với giá trị
 * - `variant`: kiểu hiển thị badge (ShadCN variant)
 */
export const CustomBadge = ({
    value,
    options,
    variant = 'default',
    children,
    className,
    'aria-label': ariaLabel,
}: CustomBadgeProps) => {
    const matchedOption = options.find((opt) => opt.value === value)
    const label = matchedOption ? matchedOption.label : String(value)

    return (
        <Badge
            variant={variant}
            aria-label={ariaLabel}
            className={cn(
                'px-2 py-1 text-sm font-medium rounded-full cursor-default',
                className
            )}
        >
            {children || label}
        </Badge>
    )
}
