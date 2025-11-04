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
} from '@/components/ui'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { Filter, Search } from 'lucide-react'
import { EmptyStateContainer } from '../EmptyStateContainer'
import { useGetRegisteredTopicQuery } from '@/services/topicApi'
import { TopicRegisteredCard } from '../card/TopicRegisteredCard'
import type { Topic } from '@/models'
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
export const TopicRegisteredChildren = () => {
	const { data: topicData = [] } = useGetRegisteredTopicQuery()
	const [registerTopics, setRegisteredTopics] = useState<Topic[]>(topicData)
	// // const [cancelRegistration, { isLoading: isCancelling, isSuccess }] = useCancelRegistrationMutation()
	useEffect(() => {
		if (JSON.stringify(registerTopics) !== JSON.stringify(topicData)) {
			setRegisteredTopics(topicData)
		}
	}, [topicData])

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/topics' },
		{ label: 'Đề tài đã đăng ký' }
	])

	const [searchTerm, setSearchTerm] = useState('')
	const [selectedField, setSelectedField] = useState('Tất cả lĩnh vực')

	const [sortBy, setSortBy] = useState('newest')
	const filteredTopic = registerTopics.filter((topic) => {
		const matchesSearch =
			topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			topic.lecturerNames.some((lecturer) => lecturer.toLowerCase().includes(searchTerm.toLowerCase()))

		const matchesField = selectedField === 'Tất cả lĩnh vực' || topic.fieldNames.includes(selectedField)
		return matchesSearch && matchesField
	})

	const sortedRegistrations = [...filteredTopic].sort((a, b) => {
		switch (sortBy) {
			case 'deadline':
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
			default:
				return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		}
	})

	return (
		<>
			{sortedRegistrations.length === 0 ? (
				<EmptyStateContainer type="registered" />
			) : (
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
						{sortedRegistrations.map((topic) => (
							<TopicRegisteredCard key={topic._id} topic={topic} />
						))}
					</div>
				</>
			)}
		</>
	)
}
