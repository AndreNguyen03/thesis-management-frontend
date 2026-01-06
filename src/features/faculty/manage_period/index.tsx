import { useState } from 'react'

import { AddPeriodModal } from './components/modals/AddPeriodModal'
import { usePageBreadcrumb } from '@/hooks'
import PeriodDataTable from './components/datatables/PeriodDataTable'

export function ManagePeriodPage() {
	const [addModalOpen, setAddModalOpen] = useState(false)

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' }
	])

	return (
		<div className='mx-5 pt-4 h-full min-h-0 w-full overflow-auto'>
			{/* Header */}
			<div className='flex flex-col' role='main'>
				<header className='mb-6 mt-6 flex items-center justify-between px-2'>
					<header className='flex flex-col items-start justify-between'>
						<h1 className='text-2xl font-bold'>Quản lý Đợt Đăng Ký</h1>
						<p className='mt-1 text-muted-foreground'>Quản lý các đợt đăng ký đề tài tốt nghiệp</p>
					</header>
				</header>
				<PeriodDataTable onOpenChange={() => setAddModalOpen(true)} />
			</div>
			{/* Add Period Modal */}
			<AddPeriodModal open={addModalOpen} onOpenChange={setAddModalOpen} />
		</div>
	)
}
