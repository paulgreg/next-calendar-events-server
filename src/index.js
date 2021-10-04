const ical = require('node-ical')
const fs = require('fs')
const calendars = require('../parameters')
const { formatEvent } = require('./string')
const { formatDate, getDates, checkIfDateInRange, checkIfPeriodicEvent } = require('./date')

const SAVED_FILE = './dist/next-events.json'

const dates = getDates()
const { today } = dates

function getEvents({ url, auth, calendar }) {
    return new Promise((resolve, reject) => {
        ical.async.fromURL(url,
            { headers: { 'Authorization': auth } },
            function (err, data) {
                if (err) reject(err)
                resolve({ calendar, data })
            })
    })
}


Promise.all(calendars.map(calendar => getEvents(calendar)))
    .then(datas => {
        const events = []
        datas.forEach(({ calendar, data }) => {
            Object.values(data)
                .filter(({ type }) => type === 'VEVENT')
                .forEach(ev => {
                    const { summary, location, start, end } = ev
                    const dateStart = formatDate(dates, start)
                    const dateEnd = formatDate(dates, end)

                    if (checkIfDateInRange(dates, { dateStart, dateEnd })) {
                        events.push(formatEvent({
                            calendar,
                            dateStart,
                            dateEnd,
                            summary,
                            location,
                            today
                        }))
                    }

                    const overrideDates = checkIfPeriodicEvent(dates, {
                        dateStart, dateEnd, rrule: ev.rrule
                    })
                    if (overrideDates) {
                        events.push(formatEvent({
                            calendar,
                            summary,
                            location,
                            today,
                            dateStart: overrideDates.dateStart,
                            dateEnd: overrideDates.dateEnd,
                        }))
                    }
                })
        })
        return events
    }).then(events => {
        return events.sort((a, b) => {
            if (a.dateStart < b.dateStart) return -1
            if (a.dateStart > b.dateStart) return 1
            return 0
        })
    }).then(events => {
        fs.writeFile(SAVED_FILE, JSON.stringify(events), (err) => {
            if (err) {
                console.log(err)
                process.exit(err)
            }
            console.log(`${events.length} events saved in ${SAVED_FILE}`)
            process.exit(0)
        })
    }).catch(e => {
        console.error(e)
        process.exit(1)
    })
