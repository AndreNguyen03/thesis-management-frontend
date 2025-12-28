import type { Phase4Response } from '@/models/period-phase.models'
import { Button } from '@/components/ui/Button'
import { ActionCard } from './ActionCard'
import { useCompletePeriodMutation } from '@/services/periodApi'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function Phase4Handler({ data }: { data: Phase4Response }) {
	//gọi api để kết thúc kì
	const { id } = useParams()
	//gọi endpoint kết thúc kì
	const [completePeriod, { isLoading: isLoadingPeriod }] = useCompletePeriodMutation()
	const handleCompletePeriod = async () => {
		if (!id) return
		try {
			await completePeriod(id).unwrap()
			toast.success('Kỳ đã được hoàn thành thành công', { richColors: true })
			//toast success
		} catch (error) {
			//toast error
			toast.error('Có lỗi xảy ra khi hoàn thành kỳ', { richColors: true })
		}
	}
	return (
		<div className='flex flex-col space-y-4 px-4'>
			{/* Nút chuyển pha - luôn hiển thị */}
			<span className='text-blue-700 font-semibold'>Tất cả các pha đã hoàn thành thành công.</span>
			<Button className='w-fit' onClick={handleCompletePeriod} disabled={isLoadingPeriod}>
				{isLoadingPeriod ? <Loader2 className='h-2 w-2 animate-spin' /> : 'Hoàn thành Kỳ hiện tại'}
				{isLoadingPeriod ? 'Đang hoàn thành kỳ...' : 'Hoàn thành Kỳ hiện tại'}
			</Button>
		</div>
	)
}
