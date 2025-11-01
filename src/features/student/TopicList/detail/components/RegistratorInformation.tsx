import { Badge } from '@/components/ui'
import { Title } from '@radix-ui/react-dialog'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import TitleBox from './TitleBox'

const RegistratorInformation = ({
	studentNames,
	lecturerNames
}: {
	studentNames: string[]
	lecturerNames: string[]
}) => {
	const [isExpanded, setIsExpanded] = useState(true)
	return (
		<div className='space-y-5'>
			<TitleBox
				title='Thông tin giảng viên, sinh viên'
				isExpanded={isExpanded}
				onClick={() => setIsExpanded(!isExpanded)}
			/>
			{isExpanded && (
				<div className='grid grid-cols-2 gap-10 sm:flex-row lg:gap-10'>
					<div className='col-span-2 flex flex-col items-center space-y-2 sm:col-span-1'>
						<Badge variant='blue' className='w-fit text-base'>
							Sinh viên:
						</Badge>
						<div className='space-x-5 space-y-5'>
							{studentNames.length > 0 ? (
								<p className='mt-1 text-gray-600'>{studentNames.join(', ')}</p>
							) : (
								<p className='mt-1 text-gray-600'>Chưa có sinh viên đăng ký</p>
							)}
						</div>
					</div>
					<div className='col-span-2 flex flex-col items-center space-y-2 sm:col-span-1'>
						<Badge variant='blue' className='w-fit text-base'>
							Giảng viên:
						</Badge>
						<div>
							{lecturerNames.length > 0 ? (
								<p className='mt-1 text-gray-600'>{lecturerNames.join(', ')}</p>
							) : (
								<p className='mt-1 text-gray-600'>Chưa có giảng viên đăng ký</p>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default RegistratorInformation
