// Scheduling utilities for automated video posting

export interface ScheduleConfig {
  topic: string
  schedule: string // Cron format
  enabled: boolean
}

export function parseCronSchedule(cron: string): { isValid: boolean; description: string } {
  const parts = cron.trim().split(/\s+/)

  if (parts.length !== 5) {
    return { isValid: false, description: 'Invalid cron format' }
  }

  try {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

    let description = 'Runs '

    // Day of week
    if (dayOfWeek !== '*') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const dayNumbers = dayOfWeek.split(',').map(d => days[parseInt(d)])
      description += `every ${dayNumbers.join(', ')} `
    } else {
      description += 'daily '
    }

    // Time
    description += `at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`

    return { isValid: true, description }
  } catch (error) {
    return { isValid: false, description: 'Invalid cron format' }
  }
}

export function getNextRunTime(cronSchedule: string): Date {
  // Simplified calculation - in production, use a proper cron parser
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0) // Default to 10 AM next day
  return tomorrow
}

export function shouldRunNow(lastRun: Date | null, cronSchedule: string): boolean {
  if (!lastRun) return true

  const now = new Date()
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)

  // Simplified check - run if more than 23 hours since last run
  return hoursSinceLastRun >= 23
}

export function optimizePostingTime(timezone: string = 'America/New_York'): string {
  // Optimal posting times based on YouTube analytics:
  // - Monday-Wednesday: 2-4 PM
  // - Thursday-Friday: 12-3 PM
  // - Weekend: 9-11 AM

  const optimalTimes = [
    '0 14 * * 1,2,3', // Mon-Wed at 2 PM
    '0 12 * * 4,5',   // Thu-Fri at 12 PM
    '0 10 * * 0,6'    // Sat-Sun at 10 AM
  ]

  return optimalTimes[0] // Default to Mon-Wed 2 PM
}
