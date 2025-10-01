import useDeepCompareEffect from 'use-deep-compare-effect'
import { useBreadcrumb } from './useBreadcrumb'

export function usePageBreadcrumb(items: { label: string; path?: string }[]) {
	const { setItems } = useBreadcrumb()

	useDeepCompareEffect(() => {
		setItems(items)
	}, [items])
}
