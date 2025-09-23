function Logo() {
	return (
		<div className='space-y-2 text-center'>
			<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-lg'>
				<span className='text-2xl font-bold text-primary-foreground'>UIT</span>
			</div>
			<h1 className='text-3xl font-bold text-primary'>UIT Thesis Management</h1>
			<p className='text-muted-foreground'>Hệ thống quản lý đề tài luận văn</p>
		</div>
	)
}

export { Logo }
