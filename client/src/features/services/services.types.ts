import type { ServiceScheduleSummary } from '@/models/service-schedule'

/**
 * One painted block in the schedule editor. The editor keeps a block per
 * weekday because that is how owners think about a week, while the database
 * stores a rule that can span several weekdays.
 */
export type ScheduleDraft = {
  key: string
  id?: string
  weekday: number
  startMinutes: number
  endMinutes: number
  capacity: number
  label: string
  exceptionDates: string[]
  isActive: boolean
}

let draftCounter = 0

export function createDraftKey(): string {
  draftCounter += 1

  return `draft-${Date.now().toString(36)}-${draftCounter}`
}

/** Expand stored rules into one editable block per weekday. */
export function schedulesToDrafts(schedules: ServiceScheduleSummary[]): ScheduleDraft[] {
  const drafts: ScheduleDraft[] = []

  for (const schedule of schedules) {
    // Date-bounded rules are one-off sessions created from the calendar. They
    // should not be turned into recurring weekly blocks when the editor opens.
    if (schedule.validFrom || schedule.validTo) {
      continue
    }

    schedule.byWeekday.forEach((weekday, index) => {
      drafts.push({
        key: createDraftKey(),

        // Only the first weekday keeps the original rule; the rest become new
        // rules on save, which normalises everything to one rule per weekday.
        id: index === 0 ? schedule.id : undefined,
        weekday,
        startMinutes: schedule.startMinutes,
        endMinutes: schedule.endMinutes,
        capacity: schedule.capacity,
        label: schedule.label,
        exceptionDates: schedule.exceptionDates,
        isActive: schedule.isActive
      })
    })
  }

  return drafts.sort((a, b) => a.weekday - b.weekday || a.startMinutes - b.startMinutes)
}

export function draftsToBlocks(drafts: ScheduleDraft[]) {
  return drafts.map(draft => ({
    id: draft.id,
    label: draft.label,
    byWeekday: [draft.weekday],
    startMinutes: draft.startMinutes,
    endMinutes: draft.endMinutes,
    capacity: draft.capacity,
    staffUserId: null,
    exceptionDates: draft.exceptionDates,
    isActive: draft.isActive
  }))
}
