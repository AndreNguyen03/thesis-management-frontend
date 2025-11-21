import { Badge } from '@/components/ui'
import { useState } from 'react'
import TitleBox from '../../../../../components/TitleBox'
import type { ResponseMiniLecturerDto, ResponseMiniStudentDto } from '@/models'

const RegistratorInformation = ({
	students,
	lecturers
}: {
	students: ResponseMiniStudentDto[]
	lecturers: ResponseMiniLecturerDto[]
}) => {
	const [isExpanded, setIsExpanded] = useState(true)
	return (
		<div>
			<TitleBox title={`Thông tin đăng ký`} isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
			<div>
				{isExpanded && (
					<div className='grid grid-cols-2 gap-10 rounded-r-lg border border-gray-300 bg-white p-5 sm:flex-row lg:gap-10'>
						<div className='col-span-2 flex flex-col items-center space-y-2 sm:col-span-1'>
							<Badge variant='blue' className='w-fit text-base'>
								Sinh viên:
							</Badge>
							<div className='space-x-5 space-y-5'>
								{students.length > 0 ? (
									<>
										{students.map((stu) => (
											<div
												className='mt-2 flex items-center justify-center space-x-2'
												key={stu._id}
											>
												<p className='mt-1 text-gray-600'>{`${stu.fullName}`}</p>
												{/* Render hình ảnh của giảng viên */}
												<div
													title={`${stu.studentCode} ${stu.fullName}`}
													className='relative mx-auto flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-center text-lg font-semibold text-gray-600'
												>
													{stu.avatarUrl ? (
														<img
															src={stu.avatarUrl}
															alt={`${stu.studentCode} ${stu.fullName}`}
															className='h-8 w-8 object-contain'
														/>
													) : (
														<span className='flex h-8 w-8 items-center justify-center text-[10px]'>
															{stu.fullName
																.split(' ')
																.map((n) => n[0])
																.join('')}
														</span>
													)}
												</div>
											</div>
										))}
									</>
								) : (
									<p className='mt-1 text-gray-600'>Chưa có sinh viên đăng ký</p>
								)}
							</div>
						</div>
						<div className='col-span-2 flex flex-col items-center space-y-2 sm:col-span-1'>
							<Badge variant='blue' className='w-fit text-base'>
								Giảng viên:
							</Badge>
							<div className='flex flex-col'>
								{lecturers.length > 0 ? (
									<>
										{lecturers.map((lec) => (
											<div
												className='mt-2 flex items-center justify-center space-x-2'
												key={lec._id}
											>
												<p className='mt-1 text-gray-600'>{`${lec.title} -${lec.fullName}`}</p>
												{/* Render hình ảnh của giảng viên */}
												<div
													title={`${lec.title} ${lec.fullName}`}
													className='relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'
												>
													{lec.avatarUrl ? (
														<img
															src={lec.avatarUrl}
															alt={`${lec.title} ${lec.fullName}`}
															className='h-8 w-8 object-contain'
														/>
													) : (
														<span className='flex h-8 w-8 items-center justify-center text-[10px]'>
															{lec.fullName
																.split(' ')
																.map((n) => n[0])
																.join('')}
														</span>
													)}
												</div>
											</div>
										))}
									</>
								) : (
									<p className='mt-1 text-gray-600'>Chưa có giảng viên đăng ký</p>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default RegistratorInformation
