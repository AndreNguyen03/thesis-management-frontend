// import { Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'

// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
// import { Filter, Search } from 'lucide-react'
// import { useEffect, useState } from 'react'
// import { topicApi, useGetTopicsQuery } from '@/services/topicApi'
// import type { Topic } from '@/models'
// import { TopicCard } from './TopicCard'

// // Mock data
// // const fields = [
// // 	'Tất cả lĩnh vực',
// // 	'Trí tuệ nhân tạo',
// // 	'IoT & Big Data',
// // 	'Blockchain',
// // 	'Natural Language Processing',
// // 	'Computer Vision',
// // 	'Web Development',
// // 	'Mobile Development'
// // ]

// import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
// import { useGetFieldsQuery } from '../../../services/fieldApi'
// export const TopicList = () => {
// 	const { data: topicsData = [] } = useGetTopicsQuery()
// 	const [topics, setTopics] = useState<Topic[]>([])
// 	const { data: fields } = useGetFieldsQuery()
// 	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Danh sách đề tài' }])
// 	useEffect(() => {
// 		if (JSON.stringify(topics) !== JSON.stringify(topicsData)) {
// 			setTopics(topicsData)
// 		}
// 	}, [topicsData])
// 	const [searchTerm, setSearchTerm] = useState('')
// 	const [selectedField, setSelectedField] = useState('Tất cả lĩnh vực')
// 	const [sortBy, setSortBy] = useState('newest')
// 	const filteredTopics = topics?.filter((topic) => {
// 		const matchesSearch =
// 			topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
// 			topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
// 			topic.studentNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
// 			topic.lecturerNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
// 			topic.fieldNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
// 		const matchesField = selectedField === 'Tất cả lĩnh vực' || topic.fieldNames.includes(selectedField)
// 		return matchesSearch && matchesField
// 	})
// 	const sortedTopics = [...filteredTopics].sort((a, b) => {
// 		selectedField
// 		switch (sortBy) {
// 			case 'deadline':
// 				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
// 			default:
// 				return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
// 		}
// 	})
// 	const updateStateAfterAction = (topic: Topic) => {
// 		// update local state
// 		setTopics((prevTopics) => prevTopics.map((t) => (t._id === topic._id ? topic : t)))
// 	}
// 	return (
// 		<div className='space-y-6'>
// 			{/* Header */}
// 			<div className='space-y-2'>
// 				<h1 className='text-3xl font-bold text-primary'>Danh sách đề tài</h1>
// 				<p className='text-muted-foreground'>Tìm kiếm và đăng ký đề tài luận văn phù hợp với bạn</p>
// 			</div>
// 			{/* Search and Filters */}
// 			<Card className='p-4'>
// 				<CardHeader>
// 					<CardTitle className='flex items-center gap-2 pb-2'>
// 						<Filter className='h-5 w-5' />
// 						Tìm kiếm và lọc
// 					</CardTitle>
// 				</CardHeader>
// 				<CardContent className='space-y-4'>
// 					<div className='flex flex-col gap-4 sm:flex-row'>
// 						<div className='relative flex-1'>
// 							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
// 							<Input
// 								placeholder='Tìm kiếm theo tên đề tài, giảng viên, lĩnh vực, mô tả...'
// 								className='pl-10'
// 								value={searchTerm}
// 								onChange={(e) => setSearchTerm(e.target.value)}
// 							/>
// 						</div>
// 						<Select value={selectedField} onValueChange={setSelectedField}>
// 							<SelectTrigger className='w-full sm:w-[200px]'>
// 								<SelectValue />
// 							</SelectTrigger>
// 							<SelectContent className='max-h-80'>
// 								<SelectItem value={'Tất cả lĩnh vực'}>Tất cả lĩnh vực</SelectItem>
// 								{fields?.map((field) => (
// 									<SelectItem key={field.slug} value={field.name}>
// 										{field.name}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 						<Select value={sortBy} onValueChange={setSortBy}>
// 							<SelectTrigger className='w-full sm:w-[150px]'>
// 								<SelectValue />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='newest'>Mới nhất</SelectItem>
// 								<SelectItem value='deadline'>Gần deadline</SelectItem>
// 							</SelectContent>
// 						</Select>
// 					</div>
// 				</CardContent>
// 			</Card>

// 			{/* Results */}
// 			<div className='space-y-4'>
// 				<div className='flex items-center justify-between'>
// 					<p className='text-sm text-muted-foreground'>Tìm thấy {sortedTopics.length} đề tài</p>
// 				</div>

// 				<div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2'>
// 					{sortedTopics.map((topic) => (
// 						<TopicCard
// 							key={topic._id}
// 							topic={topic}
// 							mode='all'
// 							updateAfterAction={updateStateAfterAction}
// 						/>
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	)
// }
