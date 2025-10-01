import { useContext } from "react"
import { BreadcrumbContext } from '../contexts/BreadcrumbContext'

export const useBreadcrumb = () => {
	const ctx = useContext(BreadcrumbContext)
	if (!ctx) throw new Error('useBreadcrumb must be used inside BreadcrumbProvider')
	return ctx
}