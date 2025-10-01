import { createContext, useState } from 'react'

interface TabsContextType {
	activeTab: string
	setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
	defaultValue: string
	children: React.ReactNode
	className?: string
}

const TabsProvider: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
	const [activeTab, setActiveTab] = useState<string>(defaultValue)

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab }}>
			<div className={`space-y-6 ${className}`}>{children}</div>
		</TabsContext.Provider>
	)
}

export { TabsProvider, TabsContext }
