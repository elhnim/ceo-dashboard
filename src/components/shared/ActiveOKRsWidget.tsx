import { FlagIcon } from "lucide-react"

import { DashboardWidget } from "@/components/shared/DashboardWidget"
import {
  ObjectiveSchemaError,
  getActiveObjectives,
} from "@/lib/services/objectives"
import { BusinessSchemaError, getBusinesses } from "@/lib/services/businesses"

type ObjectiveGroup = {
  businessId: string
  businessName: string
  color: string
  objectives: Awaited<ReturnType<typeof getActiveObjectives>>
}

export async function ActiveOKRsWidget() {
  let groups: ObjectiveGroup[] = []
  let statusMessage: string | null = null

  try {
    const [businesses, objectives] = await Promise.all([
      getBusinesses(),
      getActiveObjectives(),
    ])

    if (objectives.length === 0) {
      statusMessage = "No active OKRs. Create objectives in the OKRs section."
    } else {
      const businessMap = new Map(
        businesses.map((business) => [business.id, business] as const)
      )

      groups = objectives.reduce<ObjectiveGroup[]>((accumulator, objective) => {
        const existingGroup = accumulator.find(
          (group) => group.businessId === objective.business_id
        )
        const business = businessMap.get(objective.business_id)

        if (existingGroup) {
          existingGroup.objectives.push(objective)
          return accumulator
        }

        accumulator.push({
          businessId: objective.business_id,
          businessName: business?.name ?? "Unassigned business",
          color: business?.color ?? "#6366f1",
          objectives: [objective],
        })

        return accumulator
      }, [])
    }
  } catch (error) {
    if (
      error instanceof ObjectiveSchemaError ||
      error instanceof BusinessSchemaError
    ) {
      statusMessage = error.message
    } else {
      throw error
    }
  }

  return (
    <DashboardWidget
      title="Active OKRs"
      icon={<FlagIcon className="size-4 text-primary" />}
    >
      {statusMessage ? (
        <p className="text-sm leading-6 text-muted-foreground">
          {statusMessage}
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.businessId} className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <p className="text-sm font-medium">{group.businessName}</p>
              </div>
              <div className="space-y-3">
                {group.objectives.map((objective) => (
                  <div key={objective.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm leading-6">{objective.title}</p>
                      <span className="text-xs font-medium text-muted-foreground">
                        {Math.round(Number(objective.progress))}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, Number(objective.progress))
                          )}%`,
                          backgroundColor: group.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWidget>
  )
}
