const { formatEvent } = require('./string')

describe('string', () => {
    describe('formatEvent', () => {
        test('should return object', () =>
            expect(formatEvent({ a: 1 })).toStrictEqual({ a: 1, location: '', calendar: '', summary: '' })
        )
        test('should remove accents', () =>
            expect(formatEvent({
                calendar: 'Grégory',
                summary: 'théâtre',
                location: 'Évry'

            })).toStrictEqual({
                calendar: 'Gregory',
                summary: 'theatre',
                location: 'Evry'
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