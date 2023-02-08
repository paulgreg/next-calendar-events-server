const { RRule } = require('rrule')

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

const checkIfPeriodicEvent = (dates, rrule) => {
    if (rrule) {
        const { today, inFewDays } = dates
        const rruleForEvent = new RRule(rrule)
        const occurences = rruleForEvent.between(today, inFewDays)
        if (occurences.length > 0) {
            return {
                dateStart: occurences[0],
                dateEnd: occurences[0]
            }
        }
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