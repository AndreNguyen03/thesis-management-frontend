import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Student {
    id: string
    name: string
    studentCode: string
}

interface StudentAutocompleteProps {
    selectedStudents: Student[]
    onSelect: (student: Student) => void
    onRemove: (studentCode: string) => void
}

export function AutoCompleteStudent({ selectedStudents, onSelect, onRemove }: StudentAutocompleteProps) {
    const [studentQuery, setStudentQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [studentResults, setStudentResults] = useState<Student[]>([])
    const [searching, setSearching] = useState(false)

    // Debounce để tránh gọi API liên tục
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(studentQuery), 400)
        return () => clearTimeout(timer)
    }, [studentQuery])

    // Fetch sinh viên từ backend
    useEffect(() => {
        const fetchStudents = async () => {
            if (!debouncedQuery.trim()) {
                setStudentResults([])
                return
            }
            setSearching(true)
            try {
                const res = await fetch(`/api/students?query=${debouncedQuery}`)
                const data = await res.json()
                setStudentResults(data)
            } catch (err) {
                console.error(err)
            } finally {
                setSearching(false)
            }
        }
        fetchStudents()
    }, [debouncedQuery])

    return (
        <div className="space-y-2">
            <Label>Đã có sinh viên?</Label>
            <Popover open={!!studentQuery && studentResults.length > 0}>
                <PopoverTrigger asChild>
                    <Input
                        placeholder="Nhập mã số sinh viên..."
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                    />
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Tìm kiếm sinh viên..."
                            value={studentQuery}
                            onValueChange={setStudentQuery}
                        />
                        <CommandList>
                            {searching ? (
                                <CommandEmpty>Đang tìm kiếm...</CommandEmpty>
                            ) : studentResults.length === 0 ? (
                                <CommandEmpty>Không tìm thấy sinh viên</CommandEmpty>
                            ) : (
                                <CommandGroup heading="Kết quả">
                                    {studentResults.map((student) => (
                                        <CommandItem
                                            key={student.id}
                                            value={student.studentCode}
                                            onSelect={() => {
                                                onSelect(student)
                                                setStudentQuery('')
                                            }}
                                        >
                                            {student.name} — {student.studentCode}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedStudents.length > 0 && (
                <div className="mt-2 space-y-2">
                    {selectedStudents.map((student) => (
                        <div
                            key={student.studentCode}
                            className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-2 text-sm"
                        >
                            <div>
                                <p>
                                    <span className="font-medium">Tên: </span>
                                    {student.name}
                                </p>
                                <p>
                                    <span className="font-medium">MSSV: </span>
                                    {student.studentCode}
                                </p>
                            </div>
                            <button
                                onClick={() => onRemove(student.studentCode)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Xóa
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
