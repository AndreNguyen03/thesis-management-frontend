import type { LecturerProfile } from '@/models'

export function ContactInfo({ lecturer }: { lecturer: LecturerProfile }) {
	return (
		<div className='grid gap-4 md:grid-cols-2'>
			<div className='flex items-center gap-2'>
				📧 <span>{lecturer.email}</span>
			</div>
			<div className='flex items-center gap-2'>
				📞 <span>{lecturer.phone}</span>
			</div>
		</div>
	)
}
