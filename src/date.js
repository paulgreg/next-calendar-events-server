const { RRule } = require('rrule')
const { Temporal } = require('@js-temporal/polyfill')

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

const checkIfDateInRange = (
  { now, today, inFewDays },
  { dateStart, dateEnd }
) => {
  const dayEvent = dateStart.getTime() === today.getTime()
  const laterEvent = dateStart > now && dateEnd < inFewDays
  const inRangeEvent = dateStart < now && dateEnd > now // for events starting or ending in or a few days ago
  return dayEvent || laterEvent || inRangeEvent
}

const checkIfPeriodicEvent = (dates, rrule) => {
  if (rrule?._rrule) {
    const { today, inFewDays } = dates
    const occurences = rrule._rrule.between(today, inFewDays)
    if (occurences.length > 0) {
      return {
        dateStart: occurences[0],
        dateEnd: occurences[0],
      }
    }
  }
  return false
}

const isToday = (today, date) => {
  // Handle Temporal.ZonedDateTime objects from node-ical 0.26.0+
  if (date && typeof date.epochMilliseconds === 'number') {
    // Convert today to Temporal.ZonedDateTime for comparison
    const todayTemporal = Temporal.ZonedDateTime.from(today.toISOString().replace('Z', '+00:00[UTC]'));
    const tonightTemporal = todayTemporal.with({ 
      hour: 23, 
      minute: 59, 
      second: 59, 
      millisecond: 999 
    });
    return Temporal.ZonedDateTime.compare(date, tonightTemporal) <= 0;
  }
  
  // Handle regular Date objects (backward compatibility)
  const tonight = new Date(today)
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
