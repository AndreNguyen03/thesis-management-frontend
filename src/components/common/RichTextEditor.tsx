import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'

interface RichTextEditorProps {
	value: string
	onChange: (data: string) => void
	placeholder?: string
	disabled?: boolean
}

const RichTextEditor = ({ value, onChange, placeholder, disabled }: RichTextEditorProps) => {
	return (
		<div className='prose ck-content-wrapper w-full max-w-none'>
			<CKEditor
				editor={ClassicEditor}
				data={value}
				config={{
					placeholder: placeholder,
					// Bạn có thể custom toolbar ở đây nếu muốn
					toolbar: [
						'heading',
						'|',
						'bold',
						'italic',
						'link',
						'bulletedList',
						'numberedList',
						'|',
						'outdent',
						'indent',
						'|',
						'blockQuote',
						'insertTable',
						'undo',
						'redo'
					]
				}}
				disabled={disabled}
				onChange={(event, editor) => {
					const data = editor.getData()
					onChange(data)
				}}
			/>

			{/* Style tùy chỉnh để CKEditor trông đẹp hơn trong Shadcn/Tailwind */}
			<style>{`
                .ck-editor__editable_inline {
                    min-height: 200px; /* Chiều cao tối thiểu */
                    max-height: 500px;
                    border-radius: 0 0 0.5rem 0.5rem !important;
                }
                .ck-toolbar {
                    border-radius: 0.5rem 0.5rem 0 0 !important;
                }
                /* Reset list style vì Tailwind preflight thường bỏ list-style */
                .ck-content ul { list-style-type: disc; padding-left: 20px; }
                .ck-content ol { list-style-type: decimal; padding-left: 20px; }
            `}</style>
		</div>
	)
}

export default RichTextEditor
