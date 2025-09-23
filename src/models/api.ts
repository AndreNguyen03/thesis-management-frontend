export type ApiError = {
	status: number
	data?: {
		message?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any
	}
}
