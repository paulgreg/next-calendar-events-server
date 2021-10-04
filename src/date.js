const DAY = 24 * 60 * 60 * 1000

const formatDate = ({ tzOffset }, date) => {
    const d = new Date(date)
    d.setTime(d.getTime() - tzOffset)
    return d
}

const addDays = (date, nbOfDays) => new Date(date.getTime() + DAY * nbOfDays)

const getDates = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60 * 1000
    const now = Date.now()
    const today = new Date()
    today.setUTCHours(0)
    today.setUTCMinutes(0)
    today.setUTCSeconds(0)
    today.setUTCMilliseconds(0)
    const inFewDays = addDays(today, 7)
    return { now, today, inFewDays, tzOffset }
}

const checkIfDateInRange = ({ now, today, inFewDays }, { dateStart, dateEnd }) => {
    const dayEvent = dateStart.getTime() === today.getTime()
    const laterEvent = (dateStart > now && dateEnd < inFewDays)
    const inRangeEvent = (dateStart < now && dateEnd > now) // for events starting or ending in or a few days ago
    return dayEvent || laterEvent || inRangeEvent
}

const checkIfPeriodicEvent = (dates, { dateStart, dateEnd, rrule = {} } = {}) => {
    const { options } = rrule
    if (options) {
        const { now, today, inFewDays } = dates
        const { freq, until } = options
        if (freq === 2) { // repeat weekly
            const untilDate = formatDate(dates, until)
            let repeatDateStart = dateStart;
            let repeatDateEnd = dateEnd;
            while (repeatDateStart < untilDate) {
                const dayEvent = repeatDateStart.getTime() === today.getTime()
                const laterEvent = (repeatDateStart > now && repeatDateEnd < inFewDays)
                if (dayEvent || laterEvent) {
                    return {
                        dateStart: repeatDateStart,
                        dateEnd: repeatDateEnd,
                    }
                }
                repeatDateStart = addDays(repeatDateStart, 7)
                repeatDateEnd = addDays(repeatDateEnd, 7)
            }
        }
        // TODO : handle other « freq »
    }
    return false
}


const isToday = (today, date) => {
    const tonight = new Date(today.getTime())
    tonight.setUTCHours(23)
    tonight.setUTCMinutes(59)
    tonight.setUTCSeconds(59)
    tonight.setUTCMilliseconds(999)
    return date <= tonight
}

module.exports = {
    formatDate,
    getDates,
    checkIfDateInRange,
    checkIfPeriodicEvent,
    isToday,
}