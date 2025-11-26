import type { ResponseMiniLecturerDto } from './users'
export const UploadFileTypes = {
	AVATAR: 'avatar',
	DOCUMENT: 'document',
	AI_KNOWLEDGE: 'ai-knowledge',
	URL: 'url'
}

export interface GetUploadedFileDto {
	_id: string
	fileNameBase: string
	fileUrl: string
	mimeType: string
	fileType: string
	size: number
	actor: ResponseMiniLecturerDto
	created_at: Date
}

export interface RenameFilesBody {
	fileId: string
	newFileName: string
}
