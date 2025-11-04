import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useAppSelector } from '@/store/configureStore'
import { useGetCanceledRegisterTopicsQuery } from '@/services/topicApi'
import { useEffect, useState } from 'react'
import { CancelRegisteredCard } from '../card/CancelRegisteredCard'
import type { CanceledRegisteredTopic } from '@/models'
import { EmptyStateContainer } from '../EmptyStateContainer'

export const CanceledTopicsRegistration = () => {
	const user = useAppSelector((state) => state.auth.user)
	const { data: topicData = [] } = useGetCanceledRegisterTopicsQuery()
	const [topics, setTopics] = useState<CanceledRegisteredTopic[]>(topicData)
	useEffect(() => {
		if (JSON.stringify(topics) !== JSON.stringify(topicData)) {
			setTopics(topicData)
		}
	}, [topicData])
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/thesis' },
		{ label: 'Đề tài đã hủy' }
	])
	return (
		<div className='grid-cols1 grid gap-2'>
			{topics.length === 0 ? (
				<EmptyStateContainer type='canceled' />
			) : (
				topics.map((topic) => <CancelRegisteredCard key={topic._id} topic={topic} />)
			)}
		</div>
	)
}
