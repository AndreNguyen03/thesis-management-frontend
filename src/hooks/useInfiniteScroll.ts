import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
	hasMore: boolean
	isLoading: boolean
	onLoadMore: () => void
	threshold?: number
}

export function useInfiniteScroll({ hasMore, isLoading, onLoadMore, threshold = 300 }: UseInfiniteScrollOptions) {
	const observerRef = useRef<IntersectionObserver | null>(null)
	const loadMoreRef = useRef<HTMLDivElement | null>(null)

	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries
			if (target.isIntersecting && hasMore && !isLoading) {
				onLoadMore()
			}
		},
		[hasMore, isLoading, onLoadMore]
	)

	useEffect(() => {
		const element = loadMoreRef.current
		if (!element) return

		observerRef.current = new IntersectionObserver(handleObserver, {
			root: null,
			rootMargin: `${threshold}px`,
			threshold: 0
		})

		observerRef.current.observe(element)

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect()
			}
		}
	}, [handleObserver, threshold])

	return { loadMoreRef }
}
