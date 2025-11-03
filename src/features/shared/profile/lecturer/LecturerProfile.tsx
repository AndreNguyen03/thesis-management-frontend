import { Avatar, Button } from '@/components/ui'
import { ContactInfo } from './ContactInfo'
import { Expertise } from './Expertise'
import { Stats } from './Stats'
import { About } from './About'
import { Research } from './Research'
import { CompletedThesis } from './CompletedThesis'
import { CurrentThesis } from './CurrentThesis'
import type { LecturerUser } from '@/models'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { useNavigate } from 'react-router-dom'
import { TabsProvider } from '../../../../contexts/TabContext'
import { useTab } from '@/hooks/useTab'

interface TabButtonProps {
	tabKey: 'about' | 'research' | 'completed' | 'current'
	label: string
}

const TabButtons: React.FC = () => {
	const { activeTab, setActiveTab } = useTab()
	const tabs: TabButtonProps[] = [
		{ tabKey: 'about', label: 'Giới thiệu' },
		{ tabKey: 'research', label: 'Nghiên cứu' },
		{ tabKey: 'completed', label: 'Đã hướng dẫn' },
		{ tabKey: 'current', label: 'Đề tài hiện tại' }
	]

	return (
		<div className='flex gap-2 border-b'>
			{tabs.map(({ tabKey, label }) => (
				<button
					key={tabKey}
					className={`px-4 py-2 font-semibold ${
						activeTab === tabKey ? 'border-b-2 border-blue-600' : 'text-gray-500'
					}`}
					onClick={() => setActiveTab(tabKey)}
				>
					{label}
				</button>
			))}
		</div>
	)
}

const TabContent: React.FC<{ lecturer: LecturerUser }> = ({ lecturer }) => {
	const { activeTab } = useTab()

	return (
		<>
			{activeTab === 'about' && <About lecturer={lecturer} />}
			{activeTab === 'research' && <Research lecturer={lecturer} />}
			{activeTab === 'completed' && <CompletedThesis lecturer={lecturer} />}
			{activeTab === 'current' && <CurrentThesis lecturer={lecturer} />}
		</>
	)
}

export function LecturerProfile({ lecturer }: { lecturer: LecturerUser }) {
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Hồ sơ' }])
	const navigate = useNavigate()

	return (
		<TabsProvider defaultValue='about' className='mx-auto min-h-screen space-y-6 px-6'>
			{/* Header + Edit button */}
			<div className='mb-6 flex items-center justify-between'>
				<h1 className='text-2xl font-bold'>Hồ sơ giảng viên</h1>
				<Button size='default' className='w-fit' onClick={() => navigate('/profile/edit')}>
					Chỉnh sửa
				</Button>
			</div>

			<div className='flex flex-col gap-6 rounded-lg bg-white p-6 shadow lg:flex-row'>
				<div className='flex flex-col items-center gap-4 lg:items-start'>
					<Avatar name={lecturer.fullName || 'Nguyen Van Toan'} src={lecturer.avatar} />
					<div className='text-center lg:text-left'>
						<h1 className='text-2xl font-bold'>{lecturer.fullName}</h1>
						<p className='text-lg font-semibold'>{lecturer?.position}</p>
						<p className='leading-relaxed'>{lecturer?.department}</p>
						<p className='leading-relaxed'>{lecturer?.faculty}</p>
					</div>
				</div>

				<div className='flex-1 space-y-6'>
					<ContactInfo lecturer={lecturer} />
					{lecturer?.expertise && <Expertise expertise={lecturer.expertise} />}
					{lecturer?.thesisStats && <Stats stats={lecturer.thesisStats} />}
				</div>
			</div>

			{/* Tabs */}
			<div className='space-y-4'>
				<TabButtons />
				<TabContent lecturer={lecturer} />
			</div>
		</TabsProvider>
	)
}
