import { useMemo } from 'react'
import ReactFlow, {
	Background,
	Controls,
	MiniMap,
	Node,
	Edge,
	MarkerType,
	Position,
	useNodesState,
	useEdgesState
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Concept } from '@/models/concept.model'
import { Loader2 } from 'lucide-react'

interface ConceptNode {
	key: string
	label: string
	children: string[]
	depth: number
	aliases?: string[]
}

interface ConceptTreeVisualizationProps {
	concepts: Concept[]
	isLoading?: boolean
}

export function ConceptTreeVisualization({ concepts, isLoading }: ConceptTreeVisualizationProps) {
	const { nodes, edges } = useMemo(() => {
		if (!concepts || concepts.length === 0) {
			return { nodes: [], edges: [] }
		}

		// Build concept tree structure
		const conceptMap = new Map<string, ConceptNode>()

		// Initialize all concepts
		concepts.forEach((concept) => {
			conceptMap.set(concept.key, {
				key: concept.key,
				label: concept.label,
				children: [],
				depth: concept.key.split('.').length - 1,
				aliases: concept.aliases
			})
		})

		// Build parent-child relationships
		concepts.forEach((concept) => {
			const parts = concept.key.split('.')
			if (parts.length > 1) {
				const parentKey = parts.slice(0, -1).join('.')
				const parent = conceptMap.get(parentKey)
				if (parent) {
					parent.children.push(concept.key)
				}
			}
		})

		// Layout configuration
		const HORIZONTAL_SPACING = 300
		const VERTICAL_SPACING = 100

		const flowNodes: Node[] = []
		const flowEdges: Edge[] = []
		const levelCounts: Record<number, number> = {}

		// Helper to get node position
		const getNodePosition = (depth: number) => {
			const count = levelCounts[depth] || 0
			levelCounts[depth] = count + 1
			return {
				x: depth * HORIZONTAL_SPACING,
				y: count * VERTICAL_SPACING
			}
		}

		// Get depth-based color
		const getDepthColor = (depth: number) => {
			const colors = [
				'#3b82f6', // blue-500 - root
				'#8b5cf6', // violet-500 - level 1
				'#ec4899', // pink-500 - level 2
				'#f59e0b', // amber-500 - level 3
				'#10b981', // emerald-500 - level 4
				'#06b6d4' // cyan-500 - level 5+
			]
			return colors[Math.min(depth, colors.length - 1)]
		}

		// Build nodes in BFS order (level by level)
		const queue: string[] = []

		// Find root nodes (depth 0)
		conceptMap.forEach((node) => {
			if (node.depth === 0) {
				queue.push(node.key)
			}
		})

		// BFS traversal
		while (queue.length > 0) {
			const currentKey = queue.shift()!
			const node = conceptMap.get(currentKey)
			if (!node) continue

			const position = getNodePosition(node.depth)

			// Create React Flow node
			flowNodes.push({
				id: node.key,
				type: 'default',
				position,
				data: {
					label: (
						<div className='min-w-[120px] px-3 py-2 text-center'>
							<div className='mb-1 text-sm font-semibold'>{node.label}</div>
							<div className='font-mono text-xs text-gray-500'>{node.key}</div>
							{node.aliases && node.aliases.length > 0 && (
								<div className='mt-1'>
									<Badge variant='outline' className='text-xs'>
										+{node.aliases.length} aliases
									</Badge>
								</div>
							)}
						</div>
					)
				},
				style: {
					background: 'white',
					border: `2px solid ${getDepthColor(node.depth)}`,
					borderRadius: '8px',
					padding: 0
				},
				sourcePosition: Position.Right,
				targetPosition: Position.Left
			})

			// Create edges to children
			node.children.forEach((childKey) => {
				flowEdges.push({
					id: `${node.key}->${childKey}`,
					source: node.key,
					target: childKey,
					type: 'smoothstep',
					animated: false,
					style: { stroke: getDepthColor(node.depth), strokeWidth: 2 },
					markerEnd: {
						type: MarkerType.ArrowClosed,
						color: getDepthColor(node.depth)
					}
				})
				queue.push(childKey)
			})
		}

		return { nodes: flowNodes, edges: flowEdges }
	}, [concepts])

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Concept Tree Visualization</CardTitle>
					<CardDescription>Loading concept ontology...</CardDescription>
				</CardHeader>
				<CardContent className='flex h-[600px] items-center justify-center'>
					<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
				</CardContent>
			</Card>
		)
	}

	if (nodes.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Concept Tree Visualization</CardTitle>
					<CardDescription>No concepts found</CardDescription>
				</CardHeader>
				<CardContent className='flex h-[600px] items-center justify-center'>
					<p className='text-gray-500'>Không có concept nào trong hệ thống</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Concept Tree Visualization</CardTitle>
				<CardDescription>Hierarchical view of {concepts.length} concepts in the ontology</CardDescription>
			</CardHeader>
			<CardContent className='p-0'>
				<div className='h-[700px] w-full'>
					<ReactFlow
						nodes={nodes}
						edges={edges}
						fitView
						fitViewOptions={{
							padding: 0.2
						}}
						minZoom={0.1}
						maxZoom={1.5}
						defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
					>
						<Background />
						<Controls />
						<MiniMap
							nodeColor={(node) => {
								const depth = node.id.split('.').length - 1
								const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']
								return colors[Math.min(depth, colors.length - 1)]
							}}
							maskColor='rgba(0, 0, 0, 0.1)'
						/>
					</ReactFlow>
				</div>

				{/* Legend */}
				<div className='border-t bg-gray-50 p-4'>
					<div className='flex flex-wrap items-center gap-4'>
						<span className='text-sm font-medium text-gray-700'>Depth Levels:</span>
						{[
							{ depth: 0, label: 'Root', color: '#3b82f6' },
							{ depth: 1, label: 'Level 1', color: '#8b5cf6' },
							{ depth: 2, label: 'Level 2', color: '#ec4899' },
							{ depth: 3, label: 'Level 3', color: '#f59e0b' },
							{ depth: 4, label: 'Level 4', color: '#10b981' },
							{ depth: 5, label: 'Level 5+', color: '#06b6d4' }
						].map((item) => (
							<div key={item.depth} className='flex items-center gap-2'>
								<div className='h-4 w-4 rounded border-2' style={{ borderColor: item.color }} />
								<span className='text-xs text-gray-600'>{item.label}</span>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
