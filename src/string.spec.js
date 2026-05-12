const { formatEvent } = require('./string')

describe('string', () => {
  describe('formatEvent', () => {
    test('should return object', () =>
      expect(formatEvent({ a: 1 })).toStrictEqual({
        a: 1,
        calendar: '',
        summary: '',
      }))
    test('should convert object to string', () =>
      expect(
        formatEvent({
          calendar: 'calendar',
          summary: { val: 'value' },
        })
      ).toStrictEqual({
        calendar: 'calendar',
        summary: 'value',
      }))

    test('should remove accents', () =>
      expect(
        formatEvent({
          calendar: 'Grégory',
          summary: 'théâtre Évry l´’’äïö',
        })
      ).toStrictEqual({
        calendar: String.raw`Gr\xe9gory`,
        summary: String.raw`th\xe9\xe2tre \xc9vry l\xb4\x2019\x2019\xe4\xef\xf6`,
      }))
    test('should truncate text', () =>
      expect(
        formatEvent({
          calendar: '123456789A123456789B123456789',
          summary: '',
          location: '',
        })
      ).toStrictEqual({
        calendar: '123456789A123456789B1234',
        summary: '',
        location: '',
      }))
  })
})
