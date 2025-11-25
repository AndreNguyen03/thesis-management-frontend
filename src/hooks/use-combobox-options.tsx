// hooks/useComboboxOptions.ts
import { useState, useEffect } from 'react'

interface Option {
	value: string
	label: string
}

export const useComboboxOptions = <T extends { _id: string; [key: string]: any }>(
	data: T[] | undefined,
	page: number,
	labelKey: keyof T // Tên trường dùng làm label (vd: 'name' hoặc 'fullName')
) => {
	const [options, setOptions] = useState<Option[]>([])

	useEffect(() => {
		if (!data || data.length === 0) return

		const newOptions = data.map((item) => ({
			value: item._id,
			label: String(item[labelKey])
		}))

		// LOGIC CỐT LÕI:
		// Nếu ở trang 1, tức là mới load hoặc mới search -> Ghi đè (Replace)
		// Nếu ở trang > 1 -> Nối thêm (Append)
		if (page === 1) {
			setOptions(newOptions)
		} else {
			setOptions((prev) => {
				// Lọc trùng (De-duplicate) ngay tại đây để an toàn
				const existingIds = new Set(prev.map((o) => o.value))
				const uniqueNewOptions = newOptions.filter((o) => !existingIds.has(o.value))
				return [...prev, ...uniqueNewOptions]
			})
		}
	}, [data, page, labelKey])

	return options
}
