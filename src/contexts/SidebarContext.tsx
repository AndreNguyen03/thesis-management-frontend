import { createContext, useState, type ReactNode } from 'react'

interface SidebarContextType {
	isOpen: boolean
	toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>({
	isOpen: true,
	toggleSidebar: () => {}
})

const SidebarProvider = ({ children, defaultOpen = true }: { children: ReactNode; defaultOpen?: boolean }) => {
	const sidebar_is_open = localStorage.getItem('sidebarOpen') === 'false' ? false : defaultOpen
	const [isOpen, setIsOpen] = useState(sidebar_is_open)

	const toggleSidebar = () => {
		setIsOpen(!isOpen)
		localStorage.setItem('sidebarOpen', String(!isOpen))
	}

	return <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export { SidebarContext, SidebarProvider }
