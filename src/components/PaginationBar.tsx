import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { MetaDto } from '@/models/paginated-object.model'

// Hàm tiện ích nối class (thay thế cho clsx/tailwind-merge)
function cn(...classes: (string | undefined | null | false)[]) {
	return classes.filter(Boolean).join(' ')
}

const buttonVariants = ({ variant, size }: { variant?: string; size?: string }) => {
	const base =
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

	// Định nghĩa các variant styles
	const variants: Record<string, string> = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline',
		// Mapping style cho logic của bạn (active/nonactive)
		active: 'border border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100',
		nonactive: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900'
	}

	const sizes: Record<string, string> = {
		default: 'h-10 px-4 py-2',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-9 w-9'
	}

	const v = variants[variant || 'nonactive'] || variants['nonactive']
	const s = sizes[size || 'icon'] || sizes['icon']

	return `${base} ${v} ${s}`
}

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
	<nav
		role='navigation'
		aria-label='pagination'
		className={cn('mx-auto flex justify-center', className)}
		{...props}
	/>
)
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
	({ className, ...props }, ref) => (
		<ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
	)
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
	<li ref={ref} className={cn('', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

type PaginationLinkProps = {
	isActive?: boolean
	size?: 'default' | 'icon' | 'sm' | 'lg'
} & React.ComponentProps<'a'>

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
	<a
		aria-current={isActive ? 'page' : undefined}
		className={cn(
			buttonVariants({
				variant: isActive ? 'active' : 'nonactive',
				size
			}),
			className
		)}
		{...props}
	/>
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = ({ className, size, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label='Go to previous page'
		size={size}
		className={cn('w-auto gap-1 px-2.5', className)}
		{...props}
	>
		<ChevronLeft className='h-4 w-4' />
	</PaginationLink>
)
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = ({ className, size, ...props }: React.ComponentProps<typeof PaginationLink>) => (
	<PaginationLink
		aria-label='Go to next page'
		size={size}
		className={cn('w-auto gap-1 px-2.5', className)}
		{...props}
	>
		<ChevronRight className='h-4 w-4' />
	</PaginationLink>
)
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
	<span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
		<MoreHorizontal className='h-4 w-4' />
		<span className='sr-only'>More pages</span>
	</span>
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

interface CustomPaginationProps {
	meta: MetaDto
	onPageChange: (page: number) => void
	siblingCount?: number
}

export function CustomPagination({ meta, onPageChange, siblingCount = 1 }: CustomPaginationProps) {
	const { currentPage, totalPages, totalItems, itemsPerPage } = meta

	// Logic tính toán danh sách trang cần hiển thị
	const paginationRange = useMemo(() => {
		const totalPageNumbers = siblingCount + 5

		if (totalPages <= totalPageNumbers) {
			return range(1, totalPages)
		}

		const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
		const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

		const shouldShowLeftDots = leftSiblingIndex > 2
		const shouldShowRightDots = rightSiblingIndex < totalPages - 2

		const firstPageIndex = 1
		const lastPageIndex = totalPages

		if (!shouldShowLeftDots && shouldShowRightDots) {
			const leftItemCount = 3 + 2 * siblingCount
			const leftRange = range(1, leftItemCount)
			return [...leftRange, 'DOTS', totalPages]
		}

		if (shouldShowLeftDots && !shouldShowRightDots) {
			const rightItemCount = 3 + 2 * siblingCount
			const rightRange = range(totalPages - rightItemCount + 1, totalPages)
			return [firstPageIndex, 'DOTS', ...rightRange]
		}

		if (shouldShowLeftDots && shouldShowRightDots) {
			const middleRange = range(leftSiblingIndex, rightSiblingIndex)
			return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex]
		}

		return []
	}, [currentPage, totalPages, siblingCount])

	if (currentPage === 0 || totalPages <= 1) {
		return null
	}

	const handlePageClick = (e: React.MouseEvent, page: number) => {
		e.preventDefault()
		if (page !== currentPage) {
			onPageChange(page)
		}
	}

	return (
		<div className='mt-2 flex w-full justify-center'>
			<div className='flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-lg border bg-white px-2 py-1 shadow-sm md:flex-row'>
				<div className='text-sm font-medium text-gray-500'>
					Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}{' '}
					trong số {totalItems}
				</div>

				<Pagination className='mx-0 w-auto'>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								href='#'
								onClick={(e) => {
									e.preventDefault()
									if (currentPage > 1) onPageChange(currentPage - 1)
								}}
								className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
							/>
						</PaginationItem>

						{paginationRange.map((pageNumber, index) => {
							if (pageNumber === 'DOTS') {
								return (
									<PaginationItem key={`dots-${index}`}>
										<PaginationEllipsis />
									</PaginationItem>
								)
							}

							return (
								<PaginationItem key={pageNumber}>
									<PaginationLink
										href='#'
										isActive={pageNumber === currentPage}
										onClick={(e) => handlePageClick(e, Number(pageNumber))}
									>
										{pageNumber}
									</PaginationLink>
								</PaginationItem>
							)
						})}

						<PaginationItem>
							<PaginationNext
								href='#'
								onClick={(e) => {
									e.preventDefault()
									if (currentPage < totalPages) onPageChange(currentPage + 1)
								}}
								className={
									currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	)
}

function range(start: number, end: number) {
	const length = end - start + 1
	return Array.from({ length }, (_, idx) => idx + start)
}
