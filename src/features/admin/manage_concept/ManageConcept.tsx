import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// RTK Query hooks
import {
	useGetConceptCandidatesQuery,
	useGetConceptStatisticsQuery,
	useGetAllConceptsQuery,
	useApproveConceptCandidateMutation,
	useRejectConceptCandidateMutation,
	useDeleteConceptCandidateMutation,
	useReloadConceptIndexMutation
} from '@/services/conceptApi'

// Types
import {
	ConceptCandidate,
	ConceptStatistics,
	ConceptCandidateStatus,
	ApproveConceptDto,
	RejectConceptDto
} from '@/models/concept.model'

// Components
import { Columns } from './Columns'
import { DataTable } from './DataTable'
import { ConceptApprovalDialog } from './components/ConceptApprovalDialog'
import { ConceptDetailModal } from './components/ConceptDetailModal'
import {ConceptTreeVisualization} from './components/ConceptTreeVisualization'

export default function ManageConcept() {
	const { toast } = useToast()

	// State
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const [statusFilter, setStatusFilter] = useState<ConceptCandidateStatus | 'all'>('all')
	const [searchQuery, setSearchQuery] = useState('')

	// Dialog/Modal states
	const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [selectedCandidate, setSelectedCandidate] = useState<ConceptCandidate | null>(null)

	// RTK Query hooks
	const {
		data: candidatesData,
		isLoading: candidatesLoading,
		isFetching: candidatesFetching
	} = useGetConceptCandidatesQuery({
		page: currentPage,
		limit: pageSize,
		status: statusFilter === 'all' ? undefined : statusFilter,
		search: searchQuery || undefined
	})

	const { data: statisticsData, isLoading: statisticsLoading } = useGetConceptStatisticsQuery()

	const { data: conceptsData, isLoading: conceptsLoading } = useGetAllConceptsQuery()

	// Mutations
	const [approveCandidate, { isLoading: approveLoading }] = useApproveConceptCandidateMutation()
	const [rejectCandidate, { isLoading: rejectLoading }] = useRejectConceptCandidateMutation()
	const [deleteCandidate, { isLoading: deleteLoading }] = useDeleteConceptCandidateMutation()
	const [reloadIndex, { isLoading: reloadLoading }] = useReloadConceptIndexMutation()

	// Derived data
	const candidates = candidatesData?.data || []
	const totalCandidates = candidatesData?.meta?.total || 0
	const pageCount = Math.ceil(totalCandidates / pageSize)
	const statistics = statisticsData || {
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0
	}
	const allConcepts = conceptsData || []

	// Handlers
	const handleViewDetail = (candidate: ConceptCandidate) => {
		setSelectedCandidate(candidate)
		setDetailModalOpen(true)
	}

	const handleApprove = (candidate: ConceptCandidate) => {
		setSelectedCandidate(candidate)
		setApprovalDialogOpen(true)
	}

	const handleApproveSubmit = async (data: ApproveConceptDto) => {
		if (!selectedCandidate) return

		try {
			await approveCandidate({
				id: selectedCandidate._id,
				data
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Concept candidate approved successfully'
			})
			setApprovalDialogOpen(false)
			setSelectedCandidate(null)
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error?.data?.message || 'Failed to approve candidate',
				variant: 'destructive'
			})
		}
	}

	const handleRejectSubmit = async (data: RejectConceptDto) => {
		if (!selectedCandidate) return

		try {
			await rejectCandidate({
				id: selectedCandidate._id,
				data
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Concept candidate rejected'
			})
			setSelectedCandidate(null)
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error?.data?.message || 'Failed to reject candidate',
				variant: 'destructive'
			})
		}
	}

	const handleDeleteSubmit = async (id: string) => {
		try {
			await deleteCandidate(id).unwrap()

			toast({
				title: 'Success',
				description: 'Concept candidate deleted'
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error?.data?.message || 'Failed to delete candidate',
				variant: 'destructive'
			})
		}
	}

	const handleReloadIndex = async () => {
		try {
			await reloadIndex().unwrap()

			toast({
				title: 'Success',
				description: 'Concept index reloaded successfully'
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error?.data?.message || 'Failed to reload index',
				variant: 'destructive'
			})
		}
	}

	const handleSearch = (value: string) => {
		setSearchQuery(value)
		setCurrentPage(1) // Reset to first page on new search
	}

	const handleStatusChange = (value: string) => {
		setStatusFilter(value as ConceptCandidateStatus | 'all')
		setCurrentPage(1)
	}

	const handlePageSizeChange = (value: string) => {
		setPageSize(parseInt(value))
		setCurrentPage(1)
	}

	return (
		<div className='container mx-auto space-y-6 py-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold'>Concept Management</h1>
					<p className='text-muted-foreground'>Manage concept ontology and approve new concept candidates</p>
				</div>
				<Button onClick={handleReloadIndex} disabled={reloadLoading} variant='outline'>
					{reloadLoading ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Reloading...
						</>
					) : (
						<>
							<RefreshCw className='mr-2 h-4 w-4' />
							Reload Index
						</>
					)}
				</Button>
			</div>

			<Tabs defaultValue='candidates' className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='candidates'>Candidates</TabsTrigger>
					<TabsTrigger value='statistics'>Statistics</TabsTrigger>
					<TabsTrigger value='tree'>Concept Tree</TabsTrigger>
				</TabsList>

				{/* Candidates Tab */}
				<TabsContent value='candidates' className='space-y-4'>
					<Card className='p-4'>
						<div className='flex items-end gap-4'>
							<div className='flex-1'>
								<label className='mb-2 block text-sm font-medium'>Search</label>
								<div className='relative'>
									<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
									<Input
										placeholder='Search by canonical name...'
										className='pl-10'
										value={searchQuery}
										onChange={(e) => handleSearch(e.target.value)}
									/>
								</div>
							</div>

							<div className='w-48'>
								<label className='mb-2 block text-sm font-medium'>Status</label>
								<Select value={statusFilter} onValueChange={handleStatusChange}>
									<SelectTrigger>
										<SelectValue placeholder='All' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All</SelectItem>
										<SelectItem value='pending'>Pending</SelectItem>
										<SelectItem value='approved'>Approved</SelectItem>
										<SelectItem value='rejected'>Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className='w-32'>
								<label className='mb-2 block text-sm font-medium'>Per Page</label>
								<Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='10'>10</SelectItem>
										<SelectItem value='20'>20</SelectItem>
										<SelectItem value='50'>50</SelectItem>
										<SelectItem value='100'>100</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</Card>

					<DataTable
						columns={Columns({
							onViewDetail: handleViewDetail,
							onApprove: handleApprove,
							onReject: (candidate) => {
								setSelectedCandidate(candidate)
								handleRejectSubmit({ reason: 'Not relevant' })
							},
							onDelete: handleDeleteSubmit
						})}
						data={candidates}
						isLoading={candidatesLoading || candidatesFetching}
						pagination={{
							currentPage,
							pageCount,
							onPageChange: setCurrentPage
						}}
					/>
				</TabsContent>

				{/* Statistics Tab */}
				<TabsContent value='statistics' className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
						<Card className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>Total Candidates</p>
									<p className='mt-2 text-3xl font-bold'>
										{statisticsLoading ? (
											<Loader2 className='h-8 w-8 animate-spin' />
										) : (
											statistics.total
										)}
									</p>
								</div>
								<Badge variant='secondary' className='px-3 py-1 text-lg'>
									All
								</Badge>
							</div>
						</Card>

						<Card className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>Pending</p>
									<p className='mt-2 text-3xl font-bold'>
										{statisticsLoading ? (
											<Loader2 className='h-8 w-8 animate-spin' />
										) : (
											statistics.pending
										)}
									</p>
								</div>
								<Badge variant='default' className='px-3 py-1 text-lg'>
									New
								</Badge>
							</div>
						</Card>

						<Card className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>Approved</p>
									<p className='mt-2 text-3xl font-bold'>
										{statisticsLoading ? (
											<Loader2 className='h-8 w-8 animate-spin' />
										) : (
											statistics.approved
										)}
									</p>
								</div>
								<Badge variant='outline' className='border-green-500 px-3 py-1 text-lg text-green-600'>
									✓
								</Badge>
							</div>
						</Card>

						<Card className='p-6'>
							<div className='flex items-center justify-between'>
								<div>
									<p className='text-sm font-medium text-muted-foreground'>Rejected</p>
									<p className='mt-2 text-3xl font-bold'>
										{statisticsLoading ? (
											<Loader2 className='h-8 w-8 animate-spin' />
										) : (
											statistics.rejected
										)}
									</p>
								</div>
								<Badge variant='outline' className='border-red-500 px-3 py-1 text-lg text-red-600'>
									✗
								</Badge>
							</div>
						</Card>
					</div>

					<Card className='p-6'>
						<h3 className='mb-4 text-lg font-semibold'>Overview</h3>
						<div className='space-y-4'>
							<div className='flex items-center justify-between border-b py-2'>
								<span className='text-sm font-medium'>Approval Rate</span>
								<span className='text-sm'>
									{statistics.total > 0
										? `${((statistics.approved / statistics.total) * 100).toFixed(1)}%`
										: '0%'}
								</span>
							</div>
							<div className='flex items-center justify-between border-b py-2'>
								<span className='text-sm font-medium'>Rejection Rate</span>
								<span className='text-sm'>
									{statistics.total > 0
										? `${((statistics.rejected / statistics.total) * 100).toFixed(1)}%`
										: '0%'}
								</span>
							</div>
							<div className='flex items-center justify-between py-2'>
								<span className='text-sm font-medium'>Pending Review</span>
								<span className='text-sm'>
									{statistics.total > 0
										? `${((statistics.pending / statistics.total) * 100).toFixed(1)}%`
										: '0%'}
								</span>
							</div>
						</div>
					</Card>
				</TabsContent>

				{/* Tree Visualization Tab */}
				<TabsContent value='tree' className='space-y-4'>
					<Card className='p-6'>
						<h3 className='mb-4 text-lg font-semibold'>Concept Ontology Tree</h3>
						{conceptsLoading ? (
							<div className='flex h-96 items-center justify-center'>
								<Loader2 className='h-8 w-8 animate-spin' />
							</div>
						) : (
							<ConceptTreeVisualization concepts={allConcepts} />
						)}
					</Card>
				</TabsContent>
			</Tabs>

			{/* Approval Dialog */}
			<ConceptApprovalDialog
				open={approvalDialogOpen}
				onOpenChange={setApprovalDialogOpen}
				candidate={selectedCandidate}
				onSubmit={handleApproveSubmit}
				isLoading={approveLoading}
			/>

			{/* Detail Modal */}
			<ConceptDetailModal
				open={detailModalOpen}
				onOpenChange={setDetailModalOpen}
				candidate={selectedCandidate}
			/>
		</div>
	)
}
