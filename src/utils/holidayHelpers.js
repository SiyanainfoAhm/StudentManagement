import { differenceInCalendarDays, parseISO, isValid } from 'date-fns'

/** Inclusive calendar days from start_date through end_date (e.g. Mon–Sat = 6). */
export function inclusiveHolidayDayCount(startDateLike, endDateLike) {
  const s =
    typeof startDateLike === 'string'
      ? parseISO(startDateLike.slice(0, 10))
      : startDateLike instanceof Date
        ? startDateLike
        : null
  const e =
    typeof endDateLike === 'string'
      ? parseISO(endDateLike.slice(0, 10))
      : endDateLike instanceof Date
        ? endDateLike
        : null
  if (!s || !e || !isValid(s) || !isValid(e)) return 0
  return differenceInCalendarDays(e, s) + 1
}
