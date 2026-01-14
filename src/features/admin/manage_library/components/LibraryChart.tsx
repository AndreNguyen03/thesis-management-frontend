import type { MajorDistribution } from '@/models'
import React from 'react'
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from 'recharts'

// const trendData = [
// 	{ month: 'T1', views: 400, downloads: 80 },
// 	{ month: 'T2', views: 520, downloads: 100 },
// 	{ month: 'T3', views: 680, downloads: 150 },
// 	{ month: 'T4', views: 590, downloads: 120 },
// 	{ month: 'T5', views: 780, downloads: 180 },
// 	{ month: 'T6', views: 920, downloads: 220 },
// 	{ month: 'T7', views: 1100, downloads: 280 },
// 	{ month: 'T8', views: 980, downloads: 250 },
// 	{ month: 'T9', views: 1250, downloads: 320 },
// 	{ month: 'T10', views: 1400, downloads: 380 },
// 	{ month: 'T11', views: 1680, downloads: 420 },
// 	{ month: 'T12', views: 2300, downloads: 500 }
// ]

// const majorData = [
// 	{ name: 'CNTT', value: 45, color: 'hsl(238, 84%, 60%)' },
// 	{ name: 'Kinh tế', value: 25, color: 'hsl(160, 84%, 39%)' },
// 	{ name: 'Kỹ thuật', value: 18, color: 'hsl(38, 92%, 50%)' },
// 	{ name: 'Khác', value: 12, color: 'hsl(199, 89%, 48%)' }
// ]

const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload && payload.length) {
		return (
			<div className='rounded-lg border border-border bg-card p-3 shadow-lg'>
				<p className='mb-1 text-sm font-medium text-foreground'>{label}</p>
				{payload.map((entry: any, index: number) => (
					<p key={index} className='text-sm' style={{ color: entry.color }}>
						{entry.name}: <span className='font-semibold'>{entry.value}</span>
					</p>
				))}
			</div>
		)
	}
	return null
}

export const TrendChart: React.FC<{
	data?: { month: string; views: number; downloads: number }[]
}> = ({ data }) => {
	const chartData = data && data.length ? data : []

	return (
		<div className='rounded-xl bg-card p-5 shadow-card'>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold text-foreground'>Xu hướng truy cập</h3>
				<p className='text-sm text-muted-foreground'>Lượt xem và tải xuống trong 12 tháng qua</p>
			</div>
			<div className='h-[280px] w-full'>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
						<defs>
							<linearGradient id='colorViews' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor='hsl(238, 84%, 60%)' stopOpacity={0.3} />
								<stop offset='95%' stopColor='hsl(238, 84%, 60%)' stopOpacity={0} />
							</linearGradient>
							<linearGradient id='colorDownloads' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor='hsl(160, 84%, 39%)' stopOpacity={0.3} />
								<stop offset='95%' stopColor='hsl(160, 84%, 39%)' stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 13%, 91%)' vertical={false} />
						<XAxis
							dataKey='month'
							axisLine={false}
							tickLine={false}
							tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }}
						/>
						<YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
						<Tooltip content={<CustomTooltip />} />
						<Area
							type='monotone'
							dataKey='views'
							name='Lượt xem'
							stroke='hsl(238, 84%, 60%)'
							strokeWidth={2}
							fillOpacity={1}
							fill='url(#colorViews)'
						/>
						<Area
							type='monotone'
							dataKey='downloads'
							name='Lượt tải'
							stroke='hsl(160, 84%, 39%)'
							strokeWidth={2}
							fillOpacity={1}
							fill='url(#colorDownloads)'
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
			<div className='mt-4 flex items-center justify-center gap-6'>
				<div className='flex items-center gap-2'>
					<div className='h-3 w-3 rounded-full bg-primary' />
					<span className='text-sm text-muted-foreground'>Lượt xem</span>
				</div>
				<div className='flex items-center gap-2'>
					<div className='h-3 w-3 rounded-full bg-accent' />
					<span className='text-sm text-muted-foreground'>Lượt tải</span>
				</div>
			</div>
		</div>
	)
}

// Default palette
const defaultMajorColors = [
	'hsl(238, 84%, 60%)',
	'hsl(160, 84%, 39%)',
	'hsl(38, 92%, 50%)',
	'hsl(199, 89%, 48%)',
	'hsl(250, 60%, 60%)',
	'hsl(14, 80%, 60%)'
]

export const MajorDistributionChart: React.FC<{
	data?: MajorDistribution[]
}> = ({ data }) => {
	// Normalize incoming data to shape { name, value, color }
	const chartData =
		data && data.length
			? data.map((d, i) => ({
					name: d.label,
					value: Number(d.percent ?? d.count ?? 0),
					color: (d as any).color ?? defaultMajorColors[i % defaultMajorColors.length]
				}))
			: []

	return (
		<div className='rounded-xl bg-card p-5 shadow-card'>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold text-foreground'>Phân bố theo ngành</h3>
				<p className='text-sm text-muted-foreground'>Tỷ lệ đề tài theo chuyên ngành</p>
			</div>
			<div className='h-[220px] w-full'>
				<ResponsiveContainer width='100%' height='100%'>
					<PieChart>
						<Pie
							data={chartData}
							cx='50%'
							cy='50%'
							innerRadius={60}
							outerRadius={90}
							paddingAngle={4}
							dataKey='value'
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
							))}
						</Pie>
						<Tooltip
							content={({ active, payload }) => {
								if (active && payload && payload.length) {
									const d = payload[0].payload
									return (
										<div className='rounded-lg border border-border bg-card px-3 py-2 shadow-lg'>
											<p className='text-sm font-medium'>{d.name}</p>
											<p className='text-sm text-muted-foreground'>{d.value}%</p>
										</div>
									)
								}
								return null
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className='mt-2 grid grid-cols-2 gap-2'>
				{chartData.map((item) => (
					<div key={item.name} className='flex items-center gap-2'>
						<div className='h-2.5 w-2.5 rounded-full' style={{ backgroundColor: item.color }} />
						<span className='text-sm text-muted-foreground'>
							{item.name} ({item.value}%)
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
