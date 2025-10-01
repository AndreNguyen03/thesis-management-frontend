export interface CardProps {
	children: React.ReactNode
	className?: string
}

export const CardHeader = ({ children, className }: CardProps) => (
	<div className={`mb-3 flex items-center gap-2 ${className || ''}`}>{children}</div>
)
