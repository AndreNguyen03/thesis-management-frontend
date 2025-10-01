import type { CardProps } from './CardHeader'

export const CardContent = ({ children, className }: CardProps) => (
	<div className={`${className || ''}`}>{children}</div>
)
