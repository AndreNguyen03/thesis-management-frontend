import React from 'react'
import { BookOpen, Eye, Download, Star, HardDrive } from 'lucide-react'
import { StatCard } from './StatCard'

const formatBytes = (bytes?: number) => {
	if (!bytes || bytes <= 0) return '0 B'
	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	const value = bytes / Math.pow(1024, i)
	return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[i]}`
}

export const LibraryDashboard: React.FC<{ overview?: SystemOverviewStats }> = ({ overview }) => {
	const stats = [
		{
			title: 'Tổng số đề tài',
			value: overview ? String(overview.totalTopics ?? 0) : '120',
			subtitle: overview ? `${overview.newTopicsThisMonth ?? 0} đề tài mới tháng này` : '12 đề tài mới tháng này',
			icon: BookOpen,
			variant: 'success' as const,
		},
		{
			title: 'Lượt xem',
			value: overview ? (overview.totalViews ?? 0).toLocaleString() : '2,300',
			subtitle: overview
				? `Trung bình ${Math.round((overview.totalViews ?? 0) / 30)}/ngày`
				: 'Trung bình 76/ngày',
			icon: Eye,
			variant: 'info' as const,
		},
		{
			title: 'Lượt tải xuống',
			value: overview ? (overview.totalDownloads ?? 0).toLocaleString() : '500',
			subtitle: overview ? `Trong hệ thống` : '45 lượt tuần này',
			icon: Download,
			variant: 'warning' as const,
		},
		{
			title: 'Đánh giá trung bình',
			value: overview ? (overview.averageRating ?? 0).toFixed(1) : '9.1',
			subtitle: overview ? `Dựa trên ${overview.ratingCount ?? 0} đánh giá` : 'Từ 120 đề tài',
			icon: Star,
			variant: 'primary' as const,
		},
		{
			title: 'Dung lượng lưu trữ',
			value: overview ? formatBytes(overview.totalStorageBytes) : '0 B',
			subtitle: overview ? 'Tổng đã dùng' : 'Chưa có dữ liệu',
			icon: HardDrive,
			variant: 'info' as const
		}
	]

	return (
		<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
			{stats.map((stat, index) => (
				<div key={stat.title} className='animate-fade-up' style={{ animationDelay: `${index * 100}ms` }}>
					<StatCard {...stat} />
				</div>
			))}
		</div>
	)
}
