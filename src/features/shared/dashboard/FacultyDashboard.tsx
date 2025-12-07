import { Phase3Handler } from "@/features/faculty/manage_period/components/Phase3Handler"
import { mockPhase3_NoOverdue, mockPhase3_WithOverdue } from "@/features/faculty/manage_period/mockPhase3"

function FacultyDashboard() {
	return (
		<div>
			Faculty Dashboard
			<Phase3Handler data={mockPhase3_WithOverdue} onCompletePhase={() => console.log('NEXT PHASE')} />
			<hr />
			<Phase3Handler data={mockPhase3_NoOverdue} onCompletePhase={() => console.log('NEXT PHASE')} />
		</div>
	)
}

export { FacultyDashboard }
