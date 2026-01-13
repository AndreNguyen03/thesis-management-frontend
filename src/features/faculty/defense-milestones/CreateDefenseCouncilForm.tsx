import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui'
import { useCreateCouncilMutation } from '@/services/defenseCouncilApi'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'

interface CreateDefenseCouncilFormProps {
	milestoneTemplateId: string
	onSuccess: () => void
	onCancel: () => void
}

export default function CreateDefenseCouncilForm({
	milestoneTemplateId,
	onSuccess,
	onCancel
}: CreateDefenseCouncilFormProps) {
	const [periodNum, setPeriodNum] = useState<number>(1)
	const [location, setLocation] = useState('')
	const [scheduledDate, setScheduledDate] = useState<string>('')
	//endpoint tạo hội đồng mới
	const [createCouncil, { isLoading: isCreating }] = useCreateCouncilMutation()
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		setError(null)
		try {
			await createCouncil({
				milestoneTemplateId,
				name: `Hội đồng ${periodNum}`,
				location,
				scheduledDate
			}).unwrap()
			onSuccess()
		} catch (err: any) {
			setError(err?.data?.message || 'Có lỗi xảy ra')
		}
	}

	return (
		<Dialog open onOpenChange={onCancel}>
			<DialogContent className='max-w-md'>
				<DialogHeader>
					<DialogTitle>Tạo hội đồng bảo vệ mới</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='flex gap-2'>
						<div className='w-fit'>
							<label className='mb-1 block font-medium'>Tên hội đồng</label>
							<Input
								value={'Hội đồng'}
								readOnly
								placeholder='Nhập tên hội đồng'
								className='w-fit bg-white'
							/>
						</div>
						<div>
							<label className='mb-1 block font-medium'>Chọn số đợt</label>
							<select
								value={periodNum}
								onChange={(e) => setPeriodNum(Number(e.target.value))}
								required
								className='w-full rounded-md border bg-white px-2 py-2'
							>
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
									<option key={num} value={num}>
										{'thứ ' + num}
									</option>
								))}
							</select>
						</div>
					</div>
					<div>
						<label className='mb-1 block font-medium'>Địa điểm</label>
						<Input
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							required
							placeholder='Nhập địa điểm'
							className='bg-white'
						/>
					</div>
					<div className='w-fit'>
						<label className='mb-1 block font-medium'>Thời gian bảo vệ</label>
						<Input
							type='datetime-local'
							value={scheduledDate}
							onChange={(e) => setScheduledDate(e.target.value)}
							required
							className='bg-white'
						/>
					</div>
					{error && <div className='text-sm text-red-600'>{error}</div>}
					<DialogFooter className='flex justify-end gap-2'>
						<Button type='button' variant='outline' onClick={onCancel} disabled={isCreating}>
							Hủy
						</Button>
						<Button type='submit' disabled={isCreating}>
							{isCreating ? 'Đang tạo...' : 'Tạo hội đồng'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
