import { Filter, Search } from 'lucide-react'
// Mock data
// const
//
// = [
// 	{
// 		id: 1,
// 		title: 'Phát triển ứng dụng AI cho chẩn đoán y tế',
// 		description:
// 			'Nghiên cứu và phát triển hệ thống AI hỗ trợ chẩn đoán bệnh thông qua hình ảnh y tế, ứng dụng deep learning và computer vision.',
// 		supervisor: 'PGS.TS. Nguyễn Văn A',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Trí tuệ nhân tạo',
// 		maxStudents: 2,
// 		registeredStudents: 1,
// 		deadline: '2024-12-30',
// 		requirements: ['Python', 'TensorFlow', 'OpenCV', 'Machine Learning'],
// 		status: 'open',
// 		rating: 4.8,
// 		views: 156
// 	},
// 	{
// 		id: 2,
// 		title: 'Hệ thống quản lý thông minh cho smart city',
// 		description:
// 			'Xây dựng platform IoT và big data để quản lý giao thông, môi trường và dịch vú công trong đô thị thông minh.',
// 		supervisor: 'TS. Trần Thị B',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'IoT & Big Data',
// 		maxStudents: 3,
// 		registeredStudents: 2,
// 		deadline: '2024-12-25',
// 		requirements: ['JavaScript', 'Node.js', 'MongoDB', 'IoT', 'Data Analytics'],
// 		status: 'open',
// 		rating: 4.6,
// 		views: 203
// 	},
// 	{
// 		id: 3,
// 		title: 'Blockchain cho quản lý chuỗi cung ứng',
// 		description:
// 			'Nghiên cứu ứng dụng công nghệ blockchain trong việc theo dõi và quản lý chuỗi cung ứng thực phẩm.',
// 		supervisor: 'TS. Lê Văn C',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Blockchain',
// 		maxStudents: 2,
// 		registeredStudents: 2,
// 		deadline: '2024-12-20',
// 		requirements: ['Solidity', 'Web3', 'Smart Contracts', 'React'],
// 		status: 'full',
// 		rating: 4.9,
// 		views: 324
// 	},
// 	{
// 		id: 4,
// 		title: 'Phân tích sentiment mạng xã hội',
// 		description:
// 			'Xây dựng hệ thống phân tích cảm xúc và xu hướng dư luận trên các nền tảng mạng xã hội sử dụng NLP.',
// 		supervisor: 'ThS. Hoàng Thị D',
// 		department: 'Khoa Công nghệ Thông tin',
// 		field: 'Natural Language Processing',
// 		maxStudents: 1,
// 		registeredStudents: 0,
// 		deadline: '2025-01-15',
// 		requirements: ['Python', 'NLTK', 'Transformers', 'Social Media APIs'],
// 		status: 'open',
// 		rating: 4.4,
// 		views: 89
// 	}
// ]

import { NavLink, Outlet } from 'react-router-dom'
export const RegisteredTopicContainer = () => {
	//const user = useAppSelector((state) => state.auth.user)

	return (
		<div className='mx-auto max-w-4xl space-y-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold text-primary'>Danh sách đề tài bạn đã đăng ký</h1>
			</div>

			{/* Results */}
			<div className='space-y-4'>
				{/* Navbar with 2 options: Registered & Cancelled */}
				<div>
					{/* Navigation với NavLink */}
					<div className='mb-4 flex gap-2'>
						<NavLink
							to='/topics/registered'
							end
							className={({ isActive }) =>
								`rounded px-4 py-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
							}
						>
							Đã đăng ký
						</NavLink>

						<NavLink
							to='canceled'
							className={({ isActive }) =>
								`rounded px-4 py-2 ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'}`
							}
						>
							Đã hủy
						</NavLink>
					</div>
				</div>

				<Outlet />
			</div>
		</div>
	)
}
