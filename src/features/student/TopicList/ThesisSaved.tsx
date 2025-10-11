import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import { Filter, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
	useCreateRegistrationMutation,
	useGetSavedThesesQuery,
	useSaveThesisMutation,
	useUnsaveThesisMutation
} from '../../../services/thesisApi'
import { useAppSelector } from '../../../store/configureStore'
import type { Thesis } from 'models/thesis.model'
import { notifyError, notifySuccess } from '@/components/ui/Toast'
import type { ApiError } from 'models'
import { ThesisInformationCard } from './ThesisInformationCard'

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
export const ThesisSaved = () => {
	const user = useAppSelector((state) => state.auth.user)
	const [saveThesis] = useSaveThesisMutation()
	const [unsaveThesis, { isSuccess: isSuccessUnsave }] = useUnsaveThesisMutation()

	const [createRegistration, { isLoading: isRegistering, isSuccess: isSuccessRegister, isError: isRegisterError }] =
		useCreateRegistrationMutation()
	const { data: savedthesesData = [], isLoading: isLoadingSaved, isError: isErrorSaved } = useGetSavedThesesQuery()
	const [theses, setTheses] = useState<Thesis[]>([])
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/' },
		{ label: 'Đề tài đã lưu' }
	])
	useEffect(() => {
		if (JSON.stringify(theses) !== JSON.stringify(savedthesesData)) {
			setTheses(savedthesesData)
		}
	}, [savedthesesData])
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
			await createRegistration({ thesisId: thesis._id }).unwrap()
			notifySuccess('Đăng ký đề tài thành công!')
			await new Promise((resolve) => setTimeout(resolve, 500))
			setTheses((prev) => prev.map((t) => (t._id === thesis._id ? thesis : t)))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			notifyError(errorMessage)
		}
	}
	const handleSave = async (thesisId: string) => {
		try {
			const { data: updatedThesis } = await saveThesis({ thesisId }).unwrap()
			notifySuccess('Đã lưu đề tài!')
			setTheses((prev) => prev.map((t) => (t._id === thesisId ? updatedThesis : t)))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			notifyError(errorMessage)
		}
	}
	const handleUnsave = async (thesisId: string) => {
		try {
			await unsaveThesis({ thesisId }).unwrap()
			await new Promise((resolve) => setTimeout(resolve, 500))
			setTheses((prev) => prev.filter((t) => t._id !== thesisId))
		} catch (err) {
			const errorMessage = getErrorMessage(err)
			notifyError(errorMessage)
		}
	}
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold text-primary'>Danh sách đề tài bạn đã lưu</h1>
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

			{/* Results */}
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<p className='text-md font-bold text-muted-foreground'>Bạn đã lưu {sortedTheses.length} đề tài</p>
				</div>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
					{sortedTheses.map((thesis) => (
						<ThesisInformationCard
							key={thesis._id}
							thesis={thesis}
							onRegister={() => handleRegister(thesis)}
							onSave={() => handleSave(thesis._id || '')}
							isSuccess={isSuccessRegister}
							isRegistered={
								isSuccessRegister ||
								thesis.registrationIds.some((reg) => reg.registrantId._id === user?.id)
							}
							mode='saved'
							isRegistering={isRegistering} //isSaved={thesis.savedBy?.some((save) => save.userId === user?.id)}
							onUnsave={() => {
								handleUnsave(thesis._id)
							}}
							isSaved={thesis.isSaved && !isSuccessUnsave}
						/>
					))}
				</div>
			</div>
		</div>
	)
}
