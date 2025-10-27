import { Badge } from '@/components/ui'
import { LandPlot } from 'lucide-react'
import type { IRegistration } from 'models'

const RelevantInformation = ({
	studentNames,
	lecturerNames,
	historyRegistrations,
	onUpdate
}: {
	studentNames: string[]
	lecturerNames: string[]
	historyRegistrations: IRegistration[]
	onUpdate: () => void
}) => {
	return (
		<div className='col-span-5 mt-8 flex flex-col items-center space-y-8 pt-0 sm:col-span-2'>
			<h4 className='text-lg font-bold text-gray-800'>Thông tin liên quan</h4>
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

				<div className='col-span-2 row-span-1 flex flex-col items-center space-y-5'>
					<Badge variant='blue' className='w-fit text-base'>
						Nhật ký đăng ký
					</Badge>
					<div className='max-h-100 flex flex-col items-center justify-center space-y-5 overflow-y-auto'>
						{historyRegistrations.length > 0 ? (
							historyRegistrations.map((reg, indx) => {
								return (
									<div key={indx} className='space-y-5'>
										{reg.deleted_at ? (
											<div className='flex items-center justify-center space-x-2 space-y-1'>
												<Badge variant='outline' className='w-fit items-start'>
													{indx == 0 ? (
														<div className='rounded-sm bg-red-500 p-0.5'>
															<LandPlot className='size-4' color='white' />
														</div>
													) : null}
													<a>{new Date(reg.deleted_at).toLocaleString('vi-VN')}</a>
												</Badge>
												<p className='mt-1 text-sm text-red-600'>Bạn đã hủy đăng ký</p>
											</div>
										) : (
											''
										)}
										<div className='flex items-center justify-center space-x-2'>
											<Badge variant='outline' className='h-fit items-start space-x-1'>
												{indx == 0 && !reg.deleted_at ? (
													<div className='rounded-sm bg-red-500 p-0.5'>
														<LandPlot className='size-4' color='white' />
													</div>
												) : null}
												<a>{new Date(reg.createdAt).toLocaleString('vi-VN')}</a>
											</Badge>
											<p className='mt-1 text-sm text-green-600'>
												Bạn đã đăng ký thành công đề tài
											</p>
										</div>
									</div>
								)
							})
						) : (
							<p className='mt-1 text-gray-600'>Chưa ghi nhận đăng ký từ bạn</p>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default RelevantInformation
