import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, User } from 'lucide-react'
import type { GroupSidebar } from '@/models/groups.model'

const teamMembers = [
	{ name: 'Nguyễn Văn A', role: 'Trưởng nhóm', mssv: '20110001', online: true },
	{ name: 'Trần Thị B', role: 'Thành viên', mssv: '20110002', online: true },
	{ name: 'Lê Văn C', role: 'Thành viên', mssv: '20110003', online: false }
]

interface TeamCardProps {
	group: GroupSidebar
}

export function TeamCard({ group }: TeamCardProps) {
    console.log(group)
	return (
		<Card className='rounded-xl border-border p-0'>
			<CardContent className='space-y-3 pt-6'>
				{/* Topic Info - Compact */}
				<div className='rounded-lg bg-accent/50 p-3'>
					<p className='text-xs text-muted-foreground'>Đề tài</p>
					<p className='mt-0.5 line-clamp-2 text-sm font-medium text-foreground'>
						{group.titleVN}
					</p>
					<div className='mt-2 flex items-center gap-1.5'>
						<User className='h-3.5 w-3.5 text-muted-foreground' />
						<span className='text-xs text-muted-foreground'>GVHD:</span>
						<span className='text-xs font-medium text-foreground'>{group.participants.toString()}</span>
					</div>
				</div>

				{/* Team Members - Compact */}
				<div className='space-y-1.5'>
					{teamMembers.map((member) => (
						<div
							key={member.mssv}
							className='flex items-center justify-between rounded-lg border border-border bg-card p-2'
						>
							<div className='flex items-center gap-2'>
								<div className='relative'>
									<div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
										{member.name.split(' ').slice(-1)[0][0]}
									</div>
									<div
										className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${
											member.online ? 'bg-success' : 'bg-muted'
										}`}
									/>
								</div>
								<div>
									<p className='text-sm font-medium text-foreground'>{member.name}</p>
									<p className='text-xs text-muted-foreground'>{member.mssv}</p>
								</div>
							</div>
							{member.role === 'Trưởng nhóm' && (
								<Badge variant='secondary' className='px-1.5 py-0 text-xs'>
									TN
								</Badge>
							)}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
