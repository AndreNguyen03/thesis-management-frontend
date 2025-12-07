// src/components/RecipientSelector.tsx

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { UserCheck, X } from 'lucide-react'

// Giả định component MultiSelect và SingleSelect
// Trong thực tế, bạn sẽ dùng ShadCN Command/Select + Badge
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ResponseMiniLecturerDto } from '@/models'

interface RecipientSelectorProps {
	recipientMode: 'custom-instructors' | 'all-students' | 'all-instructors'
	totalStudents: number
	totalLecturers: number
	availableLecturers: ResponseMiniLecturerDto[]
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({
	recipientMode,
	totalStudents,
	totalLecturers,
	availableLecturers
}) => {
	const { control, setValue } = useFormContext()
	const currentRecipients = useWatch({ control, name: 'recipients' }) || []

	// Logic giả lập MultiSelect: thêm/bớt ID
	const handleMultiSelect = (userId: string) => {
		const isSelected = currentRecipients.includes(userId)
		let newRecipients: string[]

		if (isSelected) {
			newRecipients = currentRecipients.filter((id: string) => id !== userId)
		} else {
			newRecipients = [...currentRecipients, userId]
		}
		setValue('recipients', newRecipients, { shouldValidate: true })
	}

	// --- Hiển thị Badge giải thích khi chọn All ---
	if (recipientMode.startsWith('all')) {
		const isStudentMode = recipientMode === 'all-students'
		const total = isStudentMode ? totalStudents : totalLecturers
		const role = isStudentMode ? 'sinh viên' : 'giảng viên'

		return (
			<Alert>
				<UserCheck className='h-4 w-4' />
				<AlertTitle>Gửi đến tất cả {role}!</AlertTitle>
				<AlertDescription>
					Bạn sẽ gửi email đến **{total} {role}** trong đợt này.
				</AlertDescription>
			</Alert>
		)
	}

	// --- Hiển thị Dropdown/MultiSelect khi chọn Single/Multiple ---
	return (
		<FormField
			control={control}
			name='recipients'
			render={({ field }) => (
				<FormItem>
					<FormLabel className='text-base font-semibold'>2. Chọn người nhận</FormLabel>
					<FormControl>
						{recipientMode === 'custom-instructors' && (
							// Multi Select (Token/Badge - giả lập bằng Select nhiều lần)
							<div className='space-y-2'>
								<Select onValueChange={handleMultiSelect}>
									<SelectTrigger className='border-gray-400 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500'>
										<SelectValue placeholder='Thêm người nhận...' />
									</SelectTrigger>
									<SelectContent>
										{availableLecturers.map((user) => (
											<SelectItem key={user._id} value={user._id}>
												{user.fullName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{/* Hiển thị token đã chọn */}
								<div className='flex min-h-10 flex-wrap gap-2 rounded-md border p-2'>
									{currentRecipients.length > 0 ? (
										currentRecipients.map((id: string) => {
											const user = availableLecturers.find((u) => u._id === id)
											return (
												<span
													key={id}
													className='inline-flex cursor-pointer items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800'
													onClick={() => handleMultiSelect(id)} // Cho phép xóa khi click
												>
													{user?.fullName || id}
													<X className='ml-1 h-3 w-3 text-red-500' />
												</span>
											)
										})
									) : (
										<span className='text-sm text-muted-foreground'>Chưa chọn người nhận nào.</span>
									)}
								</div>
							</div>
						)}
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}

export default RecipientSelector
