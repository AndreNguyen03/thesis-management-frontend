import { createContext, useState, type ReactNode } from 'react'

interface BreadcrumbItem {
	label: string
	path?: string
}

interface BreadcrumbContextType {
	items: BreadcrumbItem[]
	setItems: (items: BreadcrumbItem[]) => void
	hidden: boolean
	setHidden: (hidden: boolean) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined)

const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
	const [items, setItems] = useState<BreadcrumbItem[]>([])
	const [hidden, setHidden] = useState(false)
	return (
		<BreadcrumbContext.Provider value={{ items, setItems, hidden, setHidden }}>
			{children}
		</BreadcrumbContext.Provider>
	)
}

export { BreadcrumbContext, BreadcrumbProvider }
