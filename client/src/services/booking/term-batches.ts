import type { IServiceScheduleDocument } from '@/models/service-schedule'

export type TermScheduleBatch = {
  id: string
  schedules: IServiceScheduleDocument[]
}

function scheduleSignature(schedule: IServiceScheduleDocument): string {
  return [
    schedule.label?.trim().toLowerCase() ?? '',
    schedule.startMinutes,
    schedule.endMinutes,
    schedule.capacity,
    schedule.staffUserId?.toString() ?? 'any'
  ].join('|')
}

export function groupTermSchedules(schedules: IServiceScheduleDocument[]): TermScheduleBatch[] {
  const groups = new Map<string, IServiceScheduleDocument[]>()

  for (const schedule of schedules.filter(schedule => !schedule.validFrom && !schedule.validTo)) {
    const signature = scheduleSignature(schedule)

    groups.set(signature, [...(groups.get(signature) ?? []), schedule])
  }

  return [...groups.values()].map(group => {
    const sorted = [...group].sort((a, b) => a._id.toString().localeCompare(b._id.toString()))

    return {
      id: sorted.map(schedule => schedule._id.toString()).join(','),
      schedules: sorted
    }
  })
}
