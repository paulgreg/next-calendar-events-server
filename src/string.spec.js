const { formatEvent } = require('./string')

describe('string', () => {
    describe('formatEvent', () => {
        test('should return object', () =>
            expect(formatEvent({ a: 1 })).toStrictEqual({ a: 1, calendar: '', summary: '' })
        )
        test('should convert object to string', () =>
            expect(formatEvent({
                calendar: 'calendar',
                summary: { val: 'value' },
            })).toStrictEqual({
                calendar: 'calendar',
                summary: "value",
            })
        )
        test('should remove accents', () =>
            expect(formatEvent({
                calendar: 'Grégory',
                summary: 'théâtre Évry l´’’äïö',
            })).toStrictEqual({
                calendar: 'Gregory',
                summary: "theatre Evry l'''aio",
            })
        )
        test('should truncate text', () =>
            expect(formatEvent({
                calendar: '123456789A123456789B123456789',
                summary: '',
                location: ''

            })).toStrictEqual({
                calendar: '123456789A123456789B1234',
                summary: '',
                location: ''
            })
        )
    })
})