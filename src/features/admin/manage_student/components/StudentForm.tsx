import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_PASSWORD, type CreateStudentRequest, type StudentTable } from '../types'
import { useGetFacultiesQuery } from '@/services/facultyApi'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Schema cho tạo mới sinh viên
const createSchema = z.object({
    fullName: z.string().min(1, 'Họ và tên không được để trống'),
    email: z.string().email('Email không hợp lệ'),
    studentCode: z.string().min(1, 'Mã sinh viên không được để trống'),
    class: z.string().min(1, 'Lớp không được để trống'),
    major: z.string().min(1, 'Chuyên ngành không được để trống'),
    facultyId: z.string().min(1, 'Khoa không được để trống'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    isActive: z.boolean(),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^\d{9,11}$/.test(val), 'Số điện thoại không hợp lệ')
})

// Schema chỉnh sửa sinh viên (không có password)
const updateSchema = createSchema.omit({ password: true })

type CreateFormData = z.infer<typeof createSchema>
type UpdateFormData = z.infer<typeof updateSchema>

interface StudentFormProps {
    student?: StudentTable
    onSubmit: (data: CreateStudentRequest) => void
    isLoading?: boolean
}

export const StudentForm = ({ student, onSubmit, isLoading }: StudentFormProps) => {
    const isEdit = !!student
    const schema = isEdit ? updateSchema : createSchema

    const form = useForm<CreateFormData | UpdateFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            fullName: student?.fullName || '',
            email: student?.email || '',
            studentCode: student?.studentCode || '',
            class: student?.class || '',
            major: student?.major || '',
            facultyId: student?.facultyId || '',
            password: DEFAULT_PASSWORD,
            phone: student?.phone || '',
            isActive: student?.isActive ?? true
        }
    })

    const { errors } = form.formState
    const { data: faculties } = useGetFacultiesQuery()
    const [showPassword, setShowPassword] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Họ và tên + Email */}
                <div className='grid grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='fullName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và tên</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Nhập họ và tên' />
                                </FormControl>
                                <FormMessage>{errors.fullName?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type='email' {...field} placeholder='Nhập email' />
                                </FormControl>
                                <FormMessage>{errors.email?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Mã sinh viên + Lớp */}
                <div className='grid grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='studentCode'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã sinh viên</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Nhập mã sinh viên' />
                                </FormControl>
                                <FormMessage>{errors.studentCode?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='class'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lớp</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Nhập lớp' />
                                </FormControl>
                                <FormMessage>{errors.class?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Chuyên ngành + Số điện thoại */}
                <div className='grid grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='major'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Chuyên ngành</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Nhập chuyên ngành' />
                                </FormControl>
                                <FormMessage>{errors.major?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Nhập số điện thoại (tùy chọn)' />
                                </FormControl>
                                <FormMessage>{errors.phone?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Chỉ hiển thị password khi tạo mới */}
                {!isEdit && (
                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            {...field}
                                            placeholder='Nhập mật khẩu'
                                        />
                                        <button
                                            type='button'
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                                            onClick={() => setShowPassword((prev) => !prev)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage>{'password' in errors ? errors.password?.message : null}</FormMessage>
                            </FormItem>
                        )}
                    />
                )}

                {/* Khoa + Trạng thái */}
                <div className='grid grid-cols-2 gap-4'>
                    <FormField
                        control={form.control}
                        name='facultyId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Khoa</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Chọn khoa' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {faculties?.map((f) => (
                                                <SelectItem key={f.id} value={f.id}>
                                                    {f.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name='isActive'
                        render={({ field }) => (
                            <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                                <FormLabel className='text-base'>Hoạt động</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </form>
        </Form>
    )
}
