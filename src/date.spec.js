const { checkIfDateInRange, formatDate, checkIfPeriodicEvent, isToday } = require("./date")

describe('date', () => {
    const HOUR = 60 * 60 * 1000
    const tzOffset = 0
    const now = new Date('2020-01-01T12:00:00.000Z')
    const today = new Date('2020-01-01T00:00:00.000Z')
    const tomorrow = new Date('2020-01-02T00:00:00.000Z')
    const inFewDays = new Date('2020-01-07T00:00:00.000Z')
    const dates = { now, today, inFewDays, tzOffset }

    describe('formatDate', () => {
        test('should do nothing if tzOffset = 0', () =>
            expect(formatDate({ tzOffset: 0 }, now)).toStrictEqual(now)
        )
        test('should update date for tzOffset = 1h', () =>
            expect(formatDate({ tzOffset: HOUR }, now)).toStrictEqual(new Date('2020-01-01T11:00:00.000Z'))
        )
    })
    describe('checkIfDateInRange ', () => {

        test('should match if today', () =>
            expect(checkIfDateInRange(dates, {
                dateStart: new Date('2020-01-01T00:00:00.000Z'),
                dateEnd: new Date('2020-01-01T01:00:00.000Z')
            })).toStrictEqual(true)
        )

        test('should match if later today', () =>
            expect(checkIfDateInRange(dates, {
                dateStart: new Date('2020-01-01T14:00:00.000Z'),
                dateEnd: new Date('2020-01-01T15:00:00.000Z')
            })).toStrictEqual(true)
        )

        test('should match if long event like holidays', () =>
            expect(checkIfDateInRange(dates, {
                dateStart: new Date('2019-12-20T00:00:00.000Z'),
                dateEnd: new Date('2020-01-10T00:00:00.000Z')
            })).toStrictEqual(true)
        )

        test('should NOT match if yesterday ', () =>
            expect(checkIfDateInRange(dates, {
                dateStart: new Date('2019-12-31T14:00:00.000Z'),
                dateEnd: new Date('2019-12-31T15:00:00.000Z')
            })).toStrictEqual(false)
        )

        test('should NOT match if before now', () =>
            expect(checkIfDateInRange(dates, {
                dateStart: new Date('2020-01-01T08:00:00.000Z'),
                dateEnd: new Date('2020-01-01T09:00:00.000Z')
            })).toStrictEqual(false)
        )
    })
    describe('checkIfPeriodicEvent', () => {

        test('should return false if empty event', () =>
            expect(checkIfPeriodicEvent(dates, {})).toStrictEqual(false)
        )

        test('should return false if until date passed', () =>
            expect(checkIfPeriodicEvent(dates, {
                rrule: {
                    options: {
                        freq: 2,
                        until: new Date('2020-12-31T12:00:00.000Z')
                    }
                }
            })).toStrictEqual(false)
        )

        test('should match if during range', () =>
            expect(checkIfPeriodicEvent(dates, {
                dateStart: new Date('2019-12-15T12:00:00.000Z'),
                dateEnd: new Date('2019-12-15T13:00:00.000Z'),
                rrule: {
                    options: {
                        freq: 2,
                        dtstart: new Date('2019-12-15T00:00:00.000Z'),
                        until: new Date('2020-01-15T00:00:00.000Z')
                    }
                }
            })).toStrictEqual({
                "dateStart": new Date('2020-01-05T12:00:00.000Z'),
                "dateEnd": new Date('2020-01-05T13:00:00.000Z'),
            })
        )
    })
    describe('isToday', () => {
        test('should return true for today', () =>
            expect(isToday(today, today)).toStrictEqual(true)
        )
        test('should return true for now', () =>
            expect(isToday(today, now)).toStrictEqual(true)
        )
        test('should return false for tomorrow', () =>
            expect(isToday(today, tomorrow)).toStrictEqual(false)
        )
    })
})