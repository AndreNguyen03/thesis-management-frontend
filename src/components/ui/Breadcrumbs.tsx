import { useBreadcrumb } from '@/hooks/useBreadcrumb'
import { Link } from 'react-router-dom'

export const Breadcrumbs = () => {
	const { items } = useBreadcrumb()

	if (!items.length) return null

	return (
		<nav className='top-5 text-sm text-gray-600'>
			<ul className='flex gap-2'>
				{items.map((item, idx) => {
					const isLast = idx === items.length - 1
					return (
						<li key={idx} className='flex gap-2'>
							{idx > 0 && <span>/</span>}
							{isLast || !item.path ? (
								<span className='font-semibold'>{item.label}</span>
							) : (
								<Link className='hover:underline' to={item.path}>
									{item.label}
								</Link>
							)}
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
