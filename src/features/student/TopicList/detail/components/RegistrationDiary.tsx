import { Badge } from '@/components/ui'
import { LandPlot } from 'lucide-react'
import type { IRegistration } from 'models/registration.model'
import TitleBox from './TitleBox'
import { useState } from 'react'

const RegistrationDiary: React.FC<{ historyRegistrations: IRegistration[] }> = ({ historyRegistrations }) => {
	const [isExpanded, setIsExpanded] = useState(true)

	return (
		<div className='col-span-2 row-span-1 flex w-full flex-col space-y-5'>
			<TitleBox title='Nhật ký đăng ký' isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
			{isExpanded && (
				<div className='max-h-100 flex flex-col items-center justify-center space-y-5 overflow-y-auto'>
					{historyRegistrations.length > 0 ? (
						historyRegistrations.map((reg, indx) => {
							return (
								<div key={indx} className='space-y-5'>
									{reg.deleted_at ? (
										<div className='flex scale-100 items-center justify-center space-x-2 space-y-1 transition-transform duration-500 hover:scale-105'>
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
									<div className='flex items-center justify-center space-x-2 transition-transform duration-500 hover:scale-105'>
										<Badge variant='outline' className='h-fit items-start space-x-1'>
											{indx == 0 && !reg.deleted_at ? (
												<div className='rounded-sm bg-red-500 p-0.5'>
													<LandPlot className='size-4' color='white' />
												</div>
											) : null}
											<a>{new Date(reg.createdAt).toLocaleString('vi-VN')}</a>
										</Badge>
										<p className='mt-1 text-sm text-green-600'>Bạn đã đăng ký thành công đề tài</p>
									</div>
								</div>
							)
						})
					) : (
						<p className='mt-1 text-gray-600'>Chưa ghi nhận đăng ký từ bạn</p>
					)}
				</div>
			)}
		</div>
	)
}

export default RegistrationDiary
