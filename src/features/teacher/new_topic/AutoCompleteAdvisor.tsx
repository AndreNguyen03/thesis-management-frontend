import { useEffect, useState } from 'react'
import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'
import { Label } from '@/components/ui/label'

interface Advisor {
	id: string
	name: string
}

interface MultiAdvisorAutocompleteProps {
	values: string[]
	onChange: (ids: string[], names: string[]) => void
}

export function AutoCompleteAdvisor({ values, onChange }: MultiAdvisorAutocompleteProps) {
	const [query, setQuery] = useState('')
	const [results, setResults] = useState<Advisor[]>([])
	const [selectedNames, setSelectedNames] = useState<string[]>([])
	const debounced = useDebounce(query, 400)

	useEffect(() => {
		if (!debounced.trim()) return
		fetch(`/api/advisors/search?q=${encodeURIComponent(debounced)}`)
			.then((r) => r.json())
			.then(setResults)
	}, [debounced])

	const toggleSelect = (advisor: Advisor) => {
		let newIds: string[]
		let newNames: string[]
		if (values.includes(advisor.id)) {
			newIds = values.filter((id) => id !== advisor.id)
			newNames = selectedNames.filter((n) => n !== advisor.name)
		} else {
			newIds = [...values, advisor.id]
			newNames = [...selectedNames, advisor.name]
		}
		onChange(newIds, newNames)
		setSelectedNames(newNames)
	}

	return (
		<div className='space-y-2'>
			<Label>Giảng viên đồng hướng dẫn</Label>
			<Command>
				<CommandInput placeholder='Tìm giảng viên...' value={query} onValueChange={setQuery} />
				<CommandGroup>
					{results.map((advisor) => (
						<CommandItem key={advisor.id} onSelect={() => toggleSelect(advisor)}>
							<input type='checkbox' checked={values.includes(advisor.id)} readOnly className='mr-2' />
							{advisor.name}
						</CommandItem>
					))}
				</CommandGroup>
			</Command>
			<div className='flex flex-wrap gap-2'>
				{selectedNames.map((n) => (
					<span key={n} className='rounded bg-accent px-2 py-1 text-sm'>
						{n}
					</span>
				))}
			</div>
		</div>
	)
}
