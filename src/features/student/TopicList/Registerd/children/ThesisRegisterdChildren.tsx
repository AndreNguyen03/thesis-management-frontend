import type { Registration } from '@/models'
import { useEffect, useState } from 'react'

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '../../../../../components/ui'
import { ThesisRegisteredCard } from '../card/ThesisRegisteredCard'
import { useCancelRegistrationMutation, useGetRegisteredThesisQuery } from '../../../../../services/thesisApi'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { getErrorMessage } from '@/utils/catch-error'
import { Filter, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
const fields = [
	'Tất cả lĩnh vực',
	'Trí tuệ nhân tạo',
	'IoT & Big Data',
	'Blockchain',
	'Natural Language Processing',
	'Computer Vision',
	'Web Development',
	'Mobile Development'
]
export const ThesisRegisterdChildren = () => {
    const { toast } = useToast()
	const { data: registrationsData = [] } = useGetRegisteredThesisQuery()
	const [cancelRegistration, { isLoading: isCancelling, isSuccess }] = useCancelRegistrationMutation()
	const [registrations, setRegistrations] = useState<Registration[]>([])
	useEffect(() => {
		if (JSON.stringify(registrations) !== JSON.stringify(registrationsData)) {
			setRegistrations(registrationsData)
		}
	}, [registrationsData])

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/thesis' },
		{ label: 'Đề tài đã đăng ký' }
	])
	const handleCancelRegistration = async (thesisId: string) => {
		await new Promise((resolve) => setTimeout(resolve, 500))
		try {
			await cancelRegistration({ thesisId }).unwrap()
			await new Promise((resolve) => setTimeout(resolve, 500))
			setRegistrations((prev) => prev.filter((reg) => reg.thesis._id !== thesisId))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: errorMessage
			})
		}
	}

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedField, setSelectedField] = useState('Tất cả lĩnh vực')

	const [sortBy, setSortBy] = useState('newest')
	const filteredRegistrations = registrations.filter((registration) => {
		const matchesSearch =
			registration.thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			registration.thesis.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			registration.thesis.registrationIds.some(
				(registrant) =>
					registrant.registrantId.role === 'student' &&
					registrant.registrantId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
			)

		const matchesField = selectedField === 'Tất cả lĩnh vực' || registration.thesis.field === selectedField
		return matchesSearch && matchesField
	})

	const sortedRegistrations = [...filteredRegistrations].sort((a, b) => {
		switch (sortBy) {
			case 'rating':
				return b.thesis.rating - a.thesis.rating
			case 'views':
				return b.thesis.views - a.thesis.views
			case 'deadline':
				return new Date(a.thesis.deadline).getTime() - new Date(b.thesis.deadline).getTime()
			default:
				return new Date(b.thesis.updated_at).getTime() - new Date(a.thesis.updated_at).getTime()
		}
	})
	return (
		<>
			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Filter className='h-5 w-5' />
						Tìm kiếm và lọc
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-col gap-4 sm:flex-row'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
							<Input
								placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
								className='pl-10'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select value={selectedField} onValueChange={setSelectedField}>
							<SelectTrigger className='w-full sm:w-[200px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fields.map((field) => (
									<SelectItem key={field} value={field}>
										{field}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className='w-full sm:w-[150px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='newest'>Mới nhất</SelectItem>
								<SelectItem value='rating'>Đánh giá cao</SelectItem>
								<SelectItem value='views'>Xem nhiều</SelectItem>
								<SelectItem value='deadline'>Gần deadline</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-1'>
				{sortedRegistrations.map((registration) => (
					<ThesisRegisteredCard
						key={registration.thesis._id}
						registration={registration}
						onUnregister={() => handleCancelRegistration(registration.thesis._id)}
						isCanceling={isCancelling}
						isSuccess={isSuccess}
					/>
				))}
			</div>
		</>
	)
}
