import { useState } from 'react'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2 } from 'lucide-react'
import { } from '@/models/milestone.model'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import { CouncilMemberRoleOptions, type CouncilMemberRole } from '@/models/defenseCouncil.model'

interface LecturerSelectorProps {
	onSelect: (lecturer: any, role: CouncilMemberRole) => void
	availableRoles: CouncilMemberRole[]
}

export default function LecturerSelector({ onSelect, availableRoles }: LecturerSelectorProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedRole, setSelectedRole] = useState<CouncilMemberRole>(availableRoles[0])

	const [queryParams] = useState<PaginationQueryParamsDto>({
		limit: 10,
		page: 1,
		query: searchTerm,
		search_by: ['fullName', 'email']
	})

	const { data: lecturersData, isLoading } = useGetAllLecturersComboboxQuery({
		...queryParams,
		query: searchTerm
	})

	return (
		<div className='space-y-3'>
			{/* Role Selection */}
			<div className='flex gap-2'>
				{availableRoles.map((role) => (
					<Button
						key={role}
						variant={selectedRole === role ? 'default' : 'outline'}
						size='sm'
						onClick={() => setSelectedRole(role)}
					>
						{CouncilMemberRoleOptions[role].label}
					</Button>
				))}
			</div>

			{/* Search */}
			<div className='relative'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm giảng viên...'
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className='pl-9'
				/>
			</div>

			{/* Lecturers List */}
			<div className='max-h-60 space-y-2 overflow-y-auto rounded-lg border p-2'>
				{isLoading ? (
					<div className='flex items-center justify-center py-4'>
						<Loader2 className='h-6 w-6 animate-spin' />
					</div>
				) : lecturersData && lecturersData.data.length > 0 ? (
					lecturersData.data.map((lecturer) => (
						<div
							key={lecturer._id}
							className='flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50'
						>
							<div>
								<p className='font-medium'>
									{lecturer.title} {lecturer.fullName}
								</p>
								<p className='text-sm text-muted-foreground'>{lecturer.email}</p>
							</div>
							<Button size='sm' onClick={() => onSelect(lecturer, selectedRole)}>
								Chọn
							</Button>
						</div>
					))
				) : (
					<p className='py-4 text-center text-sm text-muted-foreground'>Không tìm thấy giảng viên</p>
				)}
			</div>
		</div>
	)
}
