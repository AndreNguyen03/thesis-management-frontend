import { TabsContext } from '../contexts/TabContext'
import { useContext } from 'react'

const useTab = () => {
	const context = useContext(TabsContext)
	if (!context) throw new Error('useTab must be used within a TabProvider')
	return context
}

export { useTab }
