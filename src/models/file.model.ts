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
	fileUrl?: string
	type: 'pdf' | 'doc' | 'image' | 'other'
	fileType: string
	size: number
	actor: ResponseMiniLecturerDto
	created_at: string
}

export interface RenameFilesBody {
	fileId: string
	newFileName: string
}
