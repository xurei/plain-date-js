import {describe, it, expect, vi, afterAll, beforeAll} from 'vitest';
import {PlainDate} from '../src/util/plain-date';
import assert from 'node:assert/strict';

describe('PlainDate', () => {
  describe('isValid()', () => {
    it('2024-02-29 should validate a valid date', () => {
      const date = new PlainDate(2024, 2, 29); // Leap year
      expect(date.isValid()).toBe(true);
    });

    it('2023-02-29 should invalidate an invalid date', () => {
      const date = new PlainDate(2023, 2, 29); // Non-leap year
      expect(date.isValid()).toBe(false);
    });

    it('2023-13-01 should handle invalid months', () => {
      const date = new PlainDate(2023, 13, 1);
      expect(date.isValid()).toBe(false);
    });

    it('2023-04-31 should handle invalid days in month', () => {
      const date = new PlainDate(2023, 13, 1);
      expect(date.isValid()).toBe(false);
    });
  });

  describe('fromISOString()', () => {
    const realTZ = process.env.TZ;
    afterAll(() => {
      process.env.TZ = realTZ;
    });

    describe('should return the right date, regardless of the timezone', () => {
      const timezones = [
        'America/New_York',
        'Etc/UTC',
        'Europe/Brussels'
      ];
      for (const tz of timezones) {
        it(tz, () => {
          process.env.TZ = tz;
          const date = PlainDate.fromISOString('2125-11-29');
          expect(date.toISOString()).toBe('2125-11-29');
        });
      }
    });

    it.skip('should support full ISO strings', () => {
      expect(PlainDate.fromISOString('2125-11-29T00:00:00.000Z').toISOString()).toBe('2125-11-29');
    });

    describe('without fallback', () => {
      it('should throw if the provided string is invalid', () => {
        expect(() => PlainDate.fromISOString('2125-11-29-12')).toThrow(new Error('Expression \'2125-11-29-12\' is not a valid ISO string'));
        expect(() => PlainDate.fromISOString('2125-11-29.5')).toThrow(new Error('Expression \'29.5\' in \'2125-11-29.5\' is not valid'));
        expect(() => PlainDate.fromISOString('2125-NOV-29')).toThrow(new Error('Expression \'NOV\' in \'2125-NOV-29\' is not valid'));
        expect(() => PlainDate.fromISOString('foobar-12-29')).toThrow(new Error('Expression \'foobar\' in \'foobar-12-29\' is not valid'));
        expect(() => PlainDate.fromISOString('2024-14-01')).toThrow(new Error('Expression \'2024-14-01\' is not a valid date'));
        expect(() => PlainDate.fromISOString('2024-11-31')).toThrow(new Error('Expression \'2024-11-31\' is not a valid date'));
        expect(() => PlainDate.fromISOString('2024-11-32')).toThrow(new Error('Expression \'2024-11-32\' is not a valid date'));
        expect(() => PlainDate.fromISOString('2025-02-29')).toThrow(new Error('Expression \'2025-02-29\' is not a valid date'));
      });
    });

    describe('with fallback', () => {
      it('should return the fallback date if the provided string is invalid', () => {
        expect(PlainDate.fromISOString('2125-11-29-12', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2125-11-29.5', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2125-NOV-29', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('foobar-12-29', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2024-14-01', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2024-11-31', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2024-11-32', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
        expect(PlainDate.fromISOString('2025-02-29', new PlainDate(1980, 1, 1)).toISOString()).toBe('1980-01-01');
      });
    });
  });

  describe('fromJSDate()', () => {
    const realTZ = process.env.TZ;
    afterAll(() => {
      process.env.TZ = realTZ;
    });

    describe('should return the right date, regardless of the timezone', () => {
      const timezones = [
        'America/New_York',
        'Etc/UTC',
        'Europe/Brussels'
      ];
      for (const tz of timezones) {
        it(tz, () => {
          process.env.TZ = tz;
          const date = PlainDate.fromJSDate(new Date(2024, 0, 1));
          expect(date.toISOString()).toBe('2024-01-01');
        });
      }
    });
  });

  describe('fromUTCJSDate()', () => {
    const realTZ = process.env.TZ;
    afterAll(() => {
      process.env.TZ = realTZ;
    });

    it('America/New_York', () => {
      process.env.TZ = 'America/New_York';
      const date = PlainDate.fromUTCJSDate(new Date(2024, 0, 1));
      expect(date.toISOString()).toBe('2024-01-01');
    });

    it('Europe/Paris', () => {
      process.env.TZ = 'Europe/Paris';
      const date = PlainDate.fromUTCJSDate(new Date(2024, 0, 1));
      expect(date.toISOString()).toBe('2023-12-31');
    });

    it('Etc/UTC', () => {
      process.env.TZ = 'Etc/UTC';
      const date = PlainDate.fromUTCJSDate(new Date(2024, 0, 1));
      expect(date.toISOString()).toBe('2024-01-01');
    });
  });

  it('isLeapYear()', () => {
    assert.equal(PlainDate.isLeapYear(2000), true);
    assert.equal(PlainDate.isLeapYear(2001), false);
    assert.equal(PlainDate.isLeapYear(2002), false);
    assert.equal(PlainDate.isLeapYear(2003), false);
    assert.equal(PlainDate.isLeapYear(2004), true);
    assert.equal(PlainDate.isLeapYear(2005), false);
    assert.equal(PlainDate.isLeapYear(2006), false);
    assert.equal(PlainDate.isLeapYear(2007), false);
    assert.equal(PlainDate.isLeapYear(2008), true);
    assert.equal(PlainDate.isLeapYear(2024), true);
    assert.equal(PlainDate.isLeapYear(2025), false);
    assert.equal(PlainDate.isLeapYear(2100), false);
    assert.equal(PlainDate.isLeapYear(2400), true);
  });

  it('addDays()', () => {
    assert.deepEqual(new PlainDate(2024, 2, 15).addDays(3), new PlainDate(2024, 2, 18));
    assert.deepEqual(new PlainDate(2024, 2, 15).addDays(14), new PlainDate(2024, 2, 29));
    assert.deepEqual(new PlainDate(2024, 2, 15).addDays(15), new PlainDate(2024, 3, 1));
    assert.deepEqual(new PlainDate(2023, 2, 15).addDays(14), new PlainDate(2023, 3, 1));
    assert.deepEqual(new PlainDate(2023, 2, 15).addDays(15), new PlainDate(2023, 3, 2));
    assert.deepEqual(new PlainDate(2024, 3, 3).addDays(7), new PlainDate(2024, 3, 10));
    assert.deepEqual(new PlainDate(2024, 12, 29).addDays(7), new PlainDate(2025, 1, 5));
    assert.deepEqual(new PlainDate(2024, 2, 15).addDays(-3), new PlainDate(2024, 2, 12));
  });

  it('subDays()', () => {
    assert.deepEqual(new PlainDate(2024, 2, 15).subDays(3), new PlainDate(2024, 2, 12));
    assert.deepEqual(new PlainDate(2024, 2, 15).subDays(16), new PlainDate(2024, 1, 30));
    assert.deepEqual(new PlainDate(2024, 2, 15).subDays(30), new PlainDate(2024, 1, 16));
    assert.deepEqual(new PlainDate(2024, 3, 3).subDays(7), new PlainDate(2024, 2, 25));
    assert.deepEqual(new PlainDate(2023, 3, 3).subDays(7), new PlainDate(2023, 2, 24));
    assert.deepEqual(new PlainDate(2024, 1, 3).subDays(7), new PlainDate(2023, 12, 27));
    assert.deepEqual(new PlainDate(2024, 1, 3).subDays(365), new PlainDate(2023, 1, 3));
    assert.deepEqual(new PlainDate(2025, 1, 3).subDays(365), new PlainDate(2024, 1, 4));
    assert.deepEqual(new PlainDate(2024, 2, 15).subDays(-3), new PlainDate(2024, 2, 18));
  });

  it('isEqual()', () => {
    assert.equal(new PlainDate(2024, 2, 15).isEqual(new PlainDate(2024, 2, 15)), true);
    assert.equal(new PlainDate(2000, 5, 15).isEqual(new PlainDate(2000, 5, 15)), true);
    assert.equal(new PlainDate(2000, 5, 15).isEqual(new PlainDate(2000, 5, 16)), false);
    assert.equal(new PlainDate(2000, 5, 15).isEqual(new PlainDate(2000, 6, 15)), false);
    assert.equal(new PlainDate(2000, 5, 15).isEqual(new PlainDate(2001, 5, 15)), false);
  });
  it('subDays()+addDays()', () => {
    assert.deepEqual(new PlainDate(2024, 2, 15).subDays(3).addDays(3), new PlainDate(2024, 2, 15));
    assert.deepEqual(new PlainDate(2014, 6, 28).addDays(3).subDays(3), new PlainDate(2014, 6, 28));
  });

  it('getDaysDifference()', () => {
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 2, 15)), 0);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 2, 14)), -1);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 2, 16)), 1);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 1, 15)), -31);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 2, 1)), -14);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 3, 1)), 15);
    assert.equal(new PlainDate(2023, 2, 15).getDaysDifference(new PlainDate(2024, 2, 15)), 365);
    assert.equal(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2025, 2, 15)), 366);
    assert.equal(new PlainDate(2023, 2, 15).getDaysDifference(new PlainDate(2025, 2, 15)), 365 + 366);
    assert.equal(new PlainDate(2023, 2, 15).getDaysDifference(new PlainDate(2025, 3, 5)), 365 + 366 + 13 + 5);
  });

  it('isInInterval()', () => {
    // Same month&year, days
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 2, 15), new PlainDate(2024, 2, 15)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 2, 16), new PlainDate(2024, 2, 15)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 2, 16), new PlainDate(2024, 2, 16)), false);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 1, 10), new PlainDate(2024, 2, 14)), false);

    // Same year, different months
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 1, 15), new PlainDate(2024, 2, 15)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 2, 15), new PlainDate(2024, 3, 1)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 2, 1), new PlainDate(2024, 3, 1)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 3, 15), new PlainDate(2024, 4, 15)), false);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2024, 1, 15), new PlainDate(2024, 1, 15)), false);

    // Different years
    assert.equal(new PlainDate(2024, 5, 15).isInInterval(new PlainDate(2023, 5, 15), new PlainDate(2024, 5, 15)), true);
    assert.equal(new PlainDate(2024, 6, 15).isInInterval(new PlainDate(2024, 6, 15), new PlainDate(2025, 6, 15)), true);
    assert.equal(new PlainDate(2024, 2, 15).isInInterval(new PlainDate(2023, 2, 15), new PlainDate(2023, 12, 31)), false);
  });

  it('getDayOfWeek()', () => {
    assert.equal(new PlainDate(2023, 3, 6).getDayOfWeekStr(), 'Monday');
    assert.equal(new PlainDate(2023, 3, 7).getDayOfWeekStr(), 'Tuesday');
    assert.equal(new PlainDate(2024, 8, 21).getDayOfWeekStr(), 'Wednesday');
    assert.equal(new PlainDate(2025, 1, 9).getDayOfWeekStr(), 'Thursday');
    assert.equal(new PlainDate(2025, 1, 10).getDayOfWeekStr(), 'Friday');
    assert.equal(new PlainDate(2025, 1, 17).getDayOfWeekStr(), 'Friday');
    assert.equal(new PlainDate(2025, 1, 18).getDayOfWeekStr(), 'Saturday');
    assert.equal(new PlainDate(2025, 1, 19).getDayOfWeekStr(), 'Sunday');
  });

  describe('today()', () => {
    const realTZ = process.env.TZ;
    beforeAll(() => {
      // tell vitest we use mocked time
      vi.useFakeTimers();
    });

    afterAll(() => {
      // restoring date after each test run
      vi.useRealTimers();
      process.env.TZ = realTZ;
    });

    describe('should return the right date, regardless of the timezone', () => {
      const timezones = [
        'America/New_York',
        'Etc/UTC',
        'Europe/Brussels'
      ];
      for (const tz of timezones) {
        it(tz, () => {
          process.env.TZ = tz;
          vi.setSystemTime(new Date(2000, 1, 1));
          expect(PlainDate.today().toISOString()).toBe('2000-02-01');
        });
      }
    });
    assert.equal(new PlainDate(2023, 3, 6).getDayOfWeekStr(), 'Monday');
    assert.equal(new PlainDate(2023, 3, 7).getDayOfWeekStr(), 'Tuesday');
    assert.equal(new PlainDate(2024, 8, 21).getDayOfWeekStr(), 'Wednesday');
    assert.equal(new PlainDate(2025, 1, 9).getDayOfWeekStr(), 'Thursday');
    assert.equal(new PlainDate(2025, 1, 10).getDayOfWeekStr(), 'Friday');
    assert.equal(new PlainDate(2025, 1, 17).getDayOfWeekStr(), 'Friday');
    assert.equal(new PlainDate(2025, 1, 18).getDayOfWeekStr(), 'Saturday');
    assert.equal(new PlainDate(2025, 1, 19).getDayOfWeekStr(), 'Sunday');
  });
});
