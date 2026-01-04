'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useState, type SetStateAction } from 'react'
import { Loader2, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import type { ResponseMiniLecturerDto } from '@/models'
import type { CouncilMemberRole, DefenseCouncilMember } from '@/models/milestone.model'
import { set } from 'zod'
import { Button } from '@/components/ui'

interface LecturersPanelProps {
	lecturers: ResponseMiniLecturerDto[]
	selectedLecturers: DefenseCouncilMember[]
	onSelectLecturer: (lecturerId: DefenseCouncilMember) => void
	selectedMilestone: string | null
	selectedTopics: Set<string>
	searchQueryParams: React.Dispatch<React.SetStateAction<PaginationQueryParamsDto>>
	onChangeRole: (lecturerId: string, role: CouncilMemberRole) => void
	isHaveChairPerson: boolean
	onClearSelection: () => void
	isLoadingLecturers?: boolean
}

export function LecturersPanel({
	lecturers,
	selectedLecturers,
	selectedTopics,
	onSelectLecturer,
	selectedMilestone,
	searchQueryParams,
	onChangeRole,
	isHaveChairPerson,
	onClearSelection,
	isLoadingLecturers
}: LecturersPanelProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		searchQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	return (
		<div className='flex w-1/2 flex-col gap-4'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-foreground'>Danh sách các giảng viên trong khoa </h2>
				<p className='text-sm text-muted-foreground'>Chọn giảng viên để phân công vào đợt bảo vệ</p>
			</div>

			<div className='relative'>
				<Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm theo tên và học vị giảng viên...'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
					className='bg-white pl-10'
				/>
			</div>
			{!selectedMilestone && (
				<div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
					<p className='text-sm text-amber-800'>Chọn một đợt bảo vệ</p>
				</div>
			)}
			<div className='flex flex-1 flex-col gap-2'>
				{selectedLecturers.length > 0 && (
					<Button className='w-fit' onClick={onClearSelection}>
						Bỏ chọn ({selectedLecturers.length})
					</Button>
				)}
				{isLoadingLecturers ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							<Loader2 className='mx-auto h-6 w-6 animate-spin' />
						</CardContent>
					</Card>
				) : lecturers.length === 0 ? (
					<Card className='border-dashed'>
						<CardContent className='pt-6 text-center text-muted-foreground'>
							Không có giảng viên nào được tìm thấy
						</CardContent>
					</Card>
				) : (
					<div className='max-h-[calc(100vh-300px)] flex-1 space-y-3 overflow-y-auto'>
						{lecturers.map((lecturer) => {
							const lecturerInfo = selectedLecturers.find((l) => l.memberId === lecturer._id)
							const isSelected = selectedLecturers.some((l) => l.memberId === lecturer._id)
							return (
								<Card
									key={lecturer._id}
									className={`cursor-pointer p-2 transition-all ${
										isSelected ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
									} ${!selectedMilestone || selectedTopics.size > 0 ? 'cursor-not-allowed opacity-50' : ''}`}
									onClick={() =>
										selectedMilestone &&
										selectedTopics.size === 0 &&
										onSelectLecturer({
											memberId: lecturer._id,
											role: 'member',
											title: lecturer.title,
											fullName: lecturer.fullName
										} as DefenseCouncilMember)
									}
								>
									<CardContent className='pt-4'>
										<div className='flex justify-between gap-3'>
											<div className='flex gap-3'>
												<Checkbox
													checked={isSelected}
													disabled={!selectedMilestone || selectedTopics.size > 0}
													className='mt-1'
												/>
												<div className='flex min-w-0 flex-1 items-center gap-2'>
													<h3 className='text-sm font-semibold leading-tight text-foreground'>
														{lecturer.fullName}
													</h3>
													<p className='mt-1 text-xs text-muted-foreground'>
														({lecturer.title})
													</p>
												</div>
											</div>
											{isSelected && (
												<div onClick={(e) => e.stopPropagation()}>
													<select
														value={lecturerInfo?.role}
														disabled={!selectedMilestone || selectedTopics.size > 0}
														className='rounded border px-2 py-1 text-sm'
														onChange={(e) => {
															selectedMilestone &&
																selectedTopics.size === 0 &&
																onChangeRole(
																	lecturer._id,
																	e.target.value as CouncilMemberRole
																)
														}}
													>
														<option value='' disabled>
															Chưa chọn
														</option>
														<option value='chairperson' disabled={isHaveChairPerson}>
															Chủ tịch
														</option>
														<option value='secretary'>Thư ký</option>
														<option value='member'>Ủy viên</option>
													</select>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}
