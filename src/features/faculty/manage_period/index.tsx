import { useState } from 'react'

import { AddPeriodModal } from './components/modals/AddPeriodModal'
import { PeriodsTable } from './components/PeriodTable'
import { usePageBreadcrumb } from '@/hooks'

export function ManagePeriodPage() {
	const [addModalOpen, setAddModalOpen] = useState(false)

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' }
	])

	return (
		<div className='h-[calc(100vh-10rem)] min-h-0 overflow-auto'>
			{/* Header */}
			<PeriodsTable onOpenModal={setAddModalOpen} />

			{/* Add Period Modal */}
			<AddPeriodModal open={addModalOpen} onOpenChange={setAddModalOpen} />
		</div>
	)
}
