import { describe, it, expect, beforeAll } from 'vitest'
import { checkIfPeriodicEvent, isToday } from './src/date'
import { RRule } from 'rrule'
import { Temporal } from '@js-temporal/polyfill'

describe('date utilities', () => {
  describe('isToday', () => {
    const today = new Date('2023-01-01T12:00:00Z')

    describe('with legacy Date objects', () => {
      it('should return true for same day', () => {
        const sameDay = new Date('2023-01-01T15:00:00Z')
        expect(isToday(today, sameDay)).toBe(true)
      })

      it('should return true for midnight', () => {
        const midnight = new Date('2023-01-01T00:00:00Z')
        expect(isToday(today, midnight)).toBe(true)
      })

      it('should return true for end of day', () => {
        const endOfDay = new Date('2023-01-01T23:59:59Z')
        expect(isToday(today, endOfDay)).toBe(true)
      })

      it('should return false for next day', () => {
        const nextDay = new Date('2023-01-02T01:00:00Z')
        expect(isToday(today, nextDay)).toBe(false)
      })

      it('should return false for previous day', () => {
        const prevDay = new Date('2022-12-31T23:59:59Z')
        expect(isToday(today, prevDay)).toBe(false)
      })
    })

    describe('with Temporal.ZonedDateTime objects', () => {
      it('should return true for same day', () => {
        const sameDay = Temporal.ZonedDateTime.from(
          '2023-01-01T15:00:00+00:00[UTC]'
        )
        expect(isToday(today, sameDay)).toBe(true)
      })

      it('should return true for midnight', () => {
        const midnight = Temporal.ZonedDateTime.from(
          '2023-01-01T00:00:00+00:00[UTC]'
        )
        expect(isToday(today, midnight)).toBe(true)
      })

      it('should return true for end of day', () => {
        const endOfDay = Temporal.ZonedDateTime.from(
          '2023-01-01T23:59:59+00:00[UTC]'
        )
        expect(isToday(today, endOfDay)).toBe(true)
      })

      it('should return false for next day', () => {
        const nextDay = Temporal.ZonedDateTime.from(
          '2023-01-02T01:00:00+00:00[UTC]'
        )
        expect(isToday(today, nextDay)).toBe(false)
      })

      it('should return false for previous day', () => {
        const prevDay = Temporal.ZonedDateTime.from(
          '2022-12-31T23:59:59+00:00[UTC]'
        )
        expect(isToday(today, prevDay)).toBe(false)
      })
    })
  })

  describe('checkIfPeriodicEvent', () => {
    const dates = {
      today: new Date('2023-01-01'),
      inFewDays: new Date('2023-01-08'),
    }

    describe('edge cases', () => {
      it('should return false for null rrule', () => {
        expect(checkIfPeriodicEvent(dates, null)).toBe(false)
      })

      it('should return false for undefined rrule', () => {
        expect(checkIfPeriodicEvent(dates, undefined)).toBe(false)
      })

      it('should return false for rrule without _rrule property', () => {
        const plainObject = { some: 'object' }
        expect(checkIfPeriodicEvent(dates, plainObject)).toBe(false)
      })
    })

    describe('with Temporal RRuleCompatWrapper', () => {
      it('should return periodic event dates for weekly event', () => {
        // Create a mock RRuleCompatWrapper like node-ical 0.26.0 returns
        const mockRRule = {
          _rrule: new RRule({
            freq: RRule.WEEKLY,
            dtstart: new Date('2023-01-01T12:00:00.000Z'),
            count: 4,
            byweekday: [RRule.MO],
          }),
          _dateOnly: false,
        }

        const result = checkIfPeriodicEvent(dates, mockRRule)
        expect(result).not.toBe(false)
        // The result will be Date objects (RRule.between returns Date objects)
        expect(result.dateStart).toBeInstanceOf(Date)
        expect(result.dateEnd).toBeInstanceOf(Date)
      })

      it('should return false when no occurrences in range', () => {
        const mockRRule = {
          _rrule: new RRule({
            freq: RRule.WEEKLY,
            dtstart: new Date('2024-01-01T12:00:00.000Z'), // Future date
            count: 4,
            byweekday: [RRule.MO],
          }),
          _dateOnly: false,
        }

        expect(checkIfPeriodicEvent(dates, mockRRule)).toBe(false)
      })
    })

    describe('with RRule instance (not used in node-ical 0.26.0)', () => {
      it('should return false for plain RRule instance (not supported in simplified version)', () => {
        const rruleInstance = new RRule({
          freq: RRule.WEEKLY,
          dtstart: new Date('2023-01-01T12:00:00.000Z'),
          count: 4,
          byweekday: [RRule.MO],
        })

        // Since we simplified to only handle node-ical 0.26.0 format, this should return false
        const result = checkIfPeriodicEvent(dates, rruleInstance)
        expect(result).toBe(false)
      })
    })
  })
})
