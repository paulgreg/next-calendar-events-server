import { describe, it, expect } from 'vitest'
import { Temporal } from '@js-temporal/polyfill'

describe('event sorting', () => {
  const createEvent = (dateStart) => ({ dateStart })

  const sortEvents = (events) => {
    return events.toSorted((a, b) => {
      // Handle Temporal.ZonedDateTime objects
      if (
        a.dateStart &&
        typeof a.dateStart.epochMilliseconds === 'number' &&
        b.dateStart &&
        typeof b.dateStart.epochMilliseconds === 'number'
      ) {
        return a.dateStart.epochMilliseconds - b.dateStart.epochMilliseconds
      }
      // Handle mixed: Temporal vs Date - convert Date to timestamp for comparison
      if (
        a.dateStart &&
        typeof a.dateStart.epochMilliseconds === 'number' &&
        b.dateStart instanceof Date
      ) {
        return a.dateStart.epochMilliseconds - b.dateStart.getTime()
      }
      if (
        a.dateStart instanceof Date &&
        b.dateStart &&
        typeof b.dateStart.epochMilliseconds === 'number'
      ) {
        return a.dateStart.getTime() - b.dateStart.epochMilliseconds
      }
      // Handle regular Date objects
      if (a.dateStart < b.dateStart) return -1
      if (a.dateStart > b.dateStart) return 1
      return 0
    })
  }

  describe('with legacy Date objects', () => {
    it('should sort events chronologically', () => {
      const events = [
        createEvent(new Date('2023-01-03')),
        createEvent(new Date('2023-01-01')),
        createEvent(new Date('2023-01-02')),
      ]

      const sorted = sortEvents(events)
      expect(sorted[0].dateStart).toEqual(new Date('2023-01-01'))
      expect(sorted[1].dateStart).toEqual(new Date('2023-01-02'))
      expect(sorted[2].dateStart).toEqual(new Date('2023-01-03'))
    })

    it('should handle equal dates', () => {
      const sameDate = new Date('2023-01-01')
      const events = [
        createEvent(sameDate),
        createEvent(sameDate),
        createEvent(new Date('2023-01-02')),
      ]

      const sorted = sortEvents(events)
      expect(sorted[0].dateStart).toEqual(sameDate)
      expect(sorted[1].dateStart).toEqual(sameDate)
      expect(sorted[2].dateStart).toEqual(new Date('2023-01-02'))
    })
  })

  describe('with Temporal.ZonedDateTime objects', () => {
    it('should sort events chronologically', () => {
      const events = [
        createEvent(
          Temporal.ZonedDateTime.from('2023-01-03T00:00:00+00:00[UTC]')
        ),
        createEvent(
          Temporal.ZonedDateTime.from('2023-01-01T00:00:00+00:00[UTC]')
        ),
        createEvent(
          Temporal.ZonedDateTime.from('2023-01-02T00:00:00+00:00[UTC]')
        ),
      ]

      const sorted = sortEvents(events)
      expect(sorted[0].dateStart.epochMilliseconds).toBeLessThan(
        sorted[1].dateStart.epochMilliseconds
      )
      expect(sorted[1].dateStart.epochMilliseconds).toBeLessThan(
        sorted[2].dateStart.epochMilliseconds
      )
    })

    it('should handle equal dates', () => {
      const sameDate = Temporal.ZonedDateTime.from(
        '2023-01-01T00:00:00+00:00[UTC]'
      )
      const events = [
        createEvent(sameDate),
        createEvent(sameDate),
        createEvent(
          Temporal.ZonedDateTime.from('2023-01-02T00:00:00+00:00[UTC]')
        ),
      ]

      const sorted = sortEvents(events)
      expect(sorted[0].dateStart.epochMilliseconds).toBe(
        sameDate.epochMilliseconds
      )
      expect(sorted[1].dateStart.epochMilliseconds).toBe(
        sameDate.epochMilliseconds
      )
      expect(sorted[2].dateStart.epochMilliseconds).toBeGreaterThan(
        sameDate.epochMilliseconds
      )
    })
  })

   describe('with mixed Date and Temporal objects', () => {
     it('should handle mixed types without error', () => {
       const events = [
         createEvent(new Date('2023-01-02')),
         createEvent(
           Temporal.ZonedDateTime.from('2023-01-01T00:00:00+00:00[UTC]')
         ),
         createEvent(new Date('2023-01-03')),
       ]

       // Should not throw and should maintain some order
       // When mixing types, Temporal objects should come first
       const sorted = sortEvents(events)
       expect(sorted).toHaveLength(3)
       // The Temporal object should be first since it has epochMilliseconds
       expect(typeof sorted[0].dateStart.epochMilliseconds).toBe('number')
     })

     it('should sort mixed types chronologically', () => {
       const temporalEarly = Temporal.ZonedDateTime.from('2023-01-01T00:00:00+00:00[UTC]')
       const dateMiddle = new Date('2023-01-02T12:00:00Z')
       const temporalLate = Temporal.ZonedDateTime.from('2023-01-03T00:00:00+00:00[UTC]')
       const dateEarly = new Date('2023-01-01T12:00:00Z')

       const events = [
         createEvent(dateMiddle),
         createEvent(temporalLate),
         createEvent(dateEarly),
         createEvent(temporalEarly),
       ]

       const sorted = sortEvents(events)
       expect(sorted).toHaveLength(4)
       // temporalEarly (2023-01-01T00:00) should be first
       expect(sorted[0].dateStart).toBe(temporalEarly)
       // dateEarly (2023-01-01T12:00) should be second
       expect(sorted[1].dateStart).toBe(dateEarly)
       // dateMiddle (2023-01-02T12:00) should be third
       expect(sorted[2].dateStart).toBe(dateMiddle)
       // temporalLate (2023-01-03T00:00) should be last
       expect(sorted[3].dateStart).toBe(temporalLate)
     })
   })
})
