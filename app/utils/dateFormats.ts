import { format, parseISO } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'


const getOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`
    switch (day % 10) {
        case 1: return `${day}st`
        case 2: return `${day}nd`
        case 3: return `${day}rd`
        default: return `${day}th`
    }
}

export const formatDate = (date: string | undefined, dateFormat: string = 'MMM dd, yyyy', utc: boolean = false, ordinal: boolean = false): string => {
    if (!date) {
        return ''
    }

    let baseFormat = format(parseISO(date), dateFormat)

    if (utc) {
        const utcDate = toZonedTime(date, 'UTC')

        baseFormat = format(utcDate, dateFormat)
    }

    if (ordinal) {
        const day = new Date(date).getDate()
        const ordinalDay = getOrdinal(day)
        baseFormat = baseFormat.replace(/\b\d+\b/, ordinalDay)
    }
    return baseFormat
}

export const formatDateToLcateDateString = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });