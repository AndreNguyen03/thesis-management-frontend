import { useState } from 'react'

import { AddPeriodModal } from './components/modals/AddPeriodModal'
import { toast } from '@/hooks/use-toast'
import { PeriodsTable } from './components/PeriodTable'
import { usePageBreadcrumb } from '@/hooks'

export function ManagePeriodPage() {
	const [addModalOpen, setAddModalOpen] = useState(false)

    usePageBreadcrumb([{label: 'Trang chủ', path: '/'}, {label: 'Quản lý đợt đăng ký', path: '/manage-period'}]);

	const handleAddPeriod = (data: { name: string; description: string; startDate: Date; endDate: Date }) => {
		console.log('New period data:', data)
		toast({
			title: 'Thành công',
			description: 'Đã tạo đợt đăng ký mới'
		})
	}

	return (
		<div className='min-h-screen'>
			{/* Header */}
			<PeriodsTable onOpenModal={setAddModalOpen}/>

			{/* Add Period Modal */}
			<AddPeriodModal open={addModalOpen} onOpenChange={setAddModalOpen} onSubmit={handleAddPeriod} />
		</div>
	)
}
