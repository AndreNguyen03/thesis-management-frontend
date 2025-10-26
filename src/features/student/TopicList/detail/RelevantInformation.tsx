import { Badge } from '@/components/ui'

const RelevantInformation = ({ studentNames, lecturerNames }: { studentNames: string[]; lecturerNames: string[] }) => {
	return (
		<div className='col-span-2'>
			<h4 className='mb-2 text-lg font-bold text-gray-800'>Thông tin liên quan</h4>
			<div className='space-y-4'>
				<div className='flex flex-col gap-2'>
					<Badge variant='blue' className='w-fit text-base'>
						Sinh viên:
					</Badge>
					<div className='ml-10'>
						{studentNames.length > 0 ? (
							<p className='mt-1 text-gray-600'>{studentNames.join(', ')}</p>
						) : (
							<p className='mt-1 text-gray-600'>Chưa có sinh viên đăng ký</p>
						)}
					</div>
				</div>
				<div className='flex flex-col gap-2'>
					<Badge variant='blue' className='w-fit text-base'>
						Giảng viên:
					</Badge>
					<div className='ml-10'>
						{lecturerNames.length > 0 ? (
							<p className='mt-1 text-gray-600'>{lecturerNames.join(', ')}</p>
						) : (
							<p className='mt-1 text-gray-600'>Chưa có giảng viên đăng ký</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default RelevantInformation
