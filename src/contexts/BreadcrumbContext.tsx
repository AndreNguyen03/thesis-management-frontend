import { createContext, useState, type ReactNode } from 'react'

interface BreadcrumbItem {
	label: string
	path?: string
}

interface BreadcrumbContextType {
	items: BreadcrumbItem[]
	setItems: (items: BreadcrumbItem[]) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
	const [items, setItems] = useState<BreadcrumbItem[]>([])

	return <BreadcrumbContext.Provider value={{ items, setItems }}>{children}</BreadcrumbContext.Provider>
}



export { BreadcrumbContext, BreadcrumbProvider }
