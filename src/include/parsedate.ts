export function parseDate (fullStr) {
    const [fullDate] = fullStr.split('.')
    const [dateStr, timeStr] = fullDate.split('T')
    const [year, month, day] = dateStr.split('-')
    const [hourStr, minuteStr, secondStr] = timeStr.split(':')

    const dt = new Date()
    dt.setUTCFullYear(year)
    dt.setUTCMonth(month - 1)
    dt.setUTCDate(day)
    dt.setUTCHours(hourStr)
    dt.setUTCMinutes(minuteStr)
    dt.setUTCSeconds(secondStr)

    return dt.getTime()
}
