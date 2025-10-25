import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import { Calendar, Eye, Filter, Loader2, Search, Send, Star, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	useCreateRegistrationMutation,
	useGetThesesQuery,
	useGetSavedThesesQuery,
	useSaveThesisMutation,
	useUnsaveThesisMutation
} from '../../../services/thesisApi'
import { useAppSelector } from '../../../store/configureStore'
import type { Thesis } from 'models/thesis.model'
import type { ApiError } from 'models'
import { ThesisInformationCard } from './ThesisInformationCard'
import { useToast } from '@/hooks/use-toast'
// Mock data
// const
//
// = [
// 	{
// 		id: 1,
// 		title: 'Phát triển ứng dụng AI cho chẩn đoán y tế',
// 		description:
// 			'Nghiên cứu và phát triển hệ thống AI hỗ trợ chẩn đoán bệnh thông qua hình ảnh y tế, ứng dụng deep learning và computer vision.',
// 		supervisor: 'PGS.TS. Nguyễn Văn A',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Trí tuệ nhân tạo',
// 		maxStudents: 2,
// 		registeredStudents: 1,
// 		deadline: '2024-12-30',
// 		requirements: ['Python', 'TensorFlow', 'OpenCV', 'Machine Learning'],
// 		status: 'open',
// 		rating: 4.8,
// 		views: 156
// 	},
// 	{
// 		id: 2,
// 		title: 'Hệ thống quản lý thông minh cho smart city',
// 		description:
// 			'Xây dựng platform IoT và big data để quản lý giao thông, môi trường và dịch vú công trong đô thị thông minh.',
// 		supervisor: 'TS. Trần Thị B',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'IoT & Big Data',
// 		maxStudents: 3,
// 		registeredStudents: 2,
// 		deadline: '2024-12-25',
// 		requirements: ['JavaScript', 'Node.js', 'MongoDB', 'IoT', 'Data Analytics'],
// 		status: 'open',
// 		rating: 4.6,
// 		views: 203
// 	},
// 	{
// 		id: 3,
// 		title: 'Blockchain cho quản lý chuỗi cung ứng',
// 		description:
// 			'Nghiên cứu ứng dụng công nghệ blockchain trong việc theo dõi và quản lý chuỗi cung ứng thực phẩm.',
// 		supervisor: 'TS. Lê Văn C',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Blockchain',
// 		maxStudents: 2,
// 		registeredStudents: 2,
// 		deadline: '2024-12-20',
// 		requirements: ['Solidity', 'Web3', 'Smart Contracts', 'React'],
// 		status: 'full',
// 		rating: 4.9,
// 		views: 324
// 	},
// 	{
// 		id: 4,
// 		title: 'Phân tích sentiment mạng xã hội',
// 		description:
// 			'Xây dựng hệ thống phân tích cảm xúc và xu hướng dư luận trên các nền tảng mạng xã hội sử dụng NLP.',
// 		supervisor: 'ThS. Hoàng Thị D',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Natural Language Processing',
// 		maxStudents: 1,
// 		registeredStudents: 0,
// 		deadline: '2025-01-15',
// 		requirements: ['Python', 'NLTK', 'Transformers', 'Social Media APIs'],
// 		status: 'open',
// 		rating: 4.4,
// 		views: 89
// 	}
// ]

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
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { getErrorMessage } from '@/utils/catch-error'
export const ThesisList = () => {
	const { toast } = useToast()
	const user = useAppSelector((state) => state.auth.user)
	const { data: thesesData = [], isLoading, isError: isGetThesesError, error } = useGetThesesQuery()
	console.log('Theses data from API:', thesesData)
	const [theses, setTheses] = useState<Thesis[]>(thesesData)
	const [createRegistration, { isLoading: isRegistering, isSuccess: isSuccessRegister, isError: isRegisterError }] =
		useCreateRegistrationMutation()
	const [saveThesis, { isLoading: isSaving, isSuccess: isSuccessSave, isError: isSaveError }] =
		useSaveThesisMutation()
	const [unsaveThesis, { isLoading: isUnsaving, isSuccess: isSuccessUnsave, isError: isUnsaveError }] =
		useUnsaveThesisMutation()
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Danh sách đề tài' }])

	useEffect(() => {
		if (JSON.stringify(theses) !== JSON.stringify(thesesData)) {
			setTheses(thesesData)
		}
	}, [thesesData])

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedField, setSelectedField] = useState('Tất cả lĩnh vực')
	const [sortBy, setSortBy] = useState('newest')
	const filteredTheses = theses.filter((thesis) => {
		const matchesSearch =
			thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			thesis.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			thesis.registrationIds.some(
				(reg) =>
					reg.registrantId.role === 'student' &&
					reg.registrantId.fullName.toLowerCase().includes(searchTerm.toLowerCase())
			)
		const matchesField = selectedField === 'Tất cả lĩnh vực' || thesis.field === selectedField
		return matchesSearch && matchesField
	})

	const sortedTheses = [...filteredTheses].sort((a, b) => {
		switch (sortBy) {
			case 'rating':
				return b.rating - a.rating
			case 'views':
				return b.views - a.views
			case 'deadline':
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
			default:
				return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
		}
	})

	const handleRegister = async (thesis: Thesis) => {
		await new Promise((resolve) => setTimeout(resolve, 500))
		try {
			const { data: newThesis } = await createRegistration({ thesisId: thesis._id }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Đăng ký đề tài thành công!'
			})

			await new Promise((resolve) => setTimeout(resolve, 500))
			setTheses((prev) => prev.map((t) => (t._id === thesis._id ? newThesis : t)))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: errorMessage
			})
		}
	}

	const handleSave = async (thesisId: string) => {
		try {
			const { data: updatedThesis } = await saveThesis({ thesisId }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Đăng ký đề tài thành công!'
			})
			console.log('Saved thesis with ID:', updatedThesis)
			setTheses((prev) => prev.map((t) => (t._id === thesisId ? updatedThesis : t)))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: errorMessage
			})
		}
	}
	const handleUnsave = async (thesisId: string) => {
		try {
			const { data: updatedThesis } = await unsaveThesis({ thesisId }).unwrap()
			console.log('Unsave thesis with ID:', thesisId)
			setTheses((prev) => prev.map((t) => (t._id === thesisId ? updatedThesis : t)))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: errorMessage
			})
		}
	}
	const renderDepartmentAndLecturers = (thesis: Thesis) => {
		return (
			<p className='mb-2 text-xs text-muted-foreground'>
				{thesis.registrationIds.length > 0
					? thesis.registrationIds
							.map((registrant) => {
								if (registrant.registrantId.role === 'lecturer') return registrant.registrantId.fullName
							})
							.join(', ')
					: 'Chưa có giảng viên'}
				• {thesis.department}
			</p>
		)
	}
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold text-primary'>Danh sách đề tài</h1>
				<p className='text-muted-foreground'>Tìm kiếm và đăng ký đề tài luận văn phù hợp với bạn</p>
			</div>

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

			{/* AI Suggestions */}
			<Card className='border-accent/20 bg-accent/5'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-accent'>
						<Star className='h-5 w-5' />
						Gợi ý AI cho bạn
					</CardTitle>
					<CardDescription>Dựa trên profile và sở thích của bạn</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						{theses.slice(0, 2).map((thesis) => (
							<div key={thesis._id} className='rounded-lg border border-accent/20 bg-card p-3'>
								<div className='mb-2 flex items-start justify-between'>
									<h4 className='text-sm font-medium'>{thesis.title}</h4>
									<Badge variant='default' className='bg-accent text-xs'>
										95% match
									</Badge>
								</div>
								{renderDepartmentAndLecturers(thesis)}

								<div className='mb-2 flex gap-1'>
									{thesis.requirements.slice(0, 3).map((req: string) => (
										<Badge key={req} variant='secondary' className='text-xs'>
											{req}
										</Badge>
									))}
								</div>
								<Button size='sm' className='w-full'>
									Xem chi tiết
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Results */}
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<p className='text-sm text-muted-foreground'>Tìm thấy {sortedTheses.length} đề tài</p>
				</div>

				<div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2'>
					{sortedTheses.map((thesis) => (
						<ThesisInformationCard
							key={thesis._id}
							thesis={thesis}
							onRegister={() => handleRegister(thesis)}
							isRegistered={
								isSuccessRegister ||
								thesis.registrationIds.some((reg) => reg.registrantId._id === user?.id)
							}
							mode='all'
							isRegistering={isRegistering} //isSaved={thesis.savedBy?.some((save) => save.userId === user?.id)}
							onSave={() => {
								handleSave(thesis._id)
							}}
							onUnsave={() => {
								handleUnsave(thesis._id)
							}}
							isSaved={thesis.isSaved}
							isSuccess={isSuccessRegister}
							isSaving={isSaving}
							isUnsaving={isUnsaving}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
