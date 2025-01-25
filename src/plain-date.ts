export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

// TODO export this in a NPM package and add tests. This could be useful for a large amount of devs
export class PlainDate {
  /**
   * Year of the date.
   */
  year: number;

  /**
   * Month of a year. Must be from 1 to 12.
   */
  month: number;

  /**
   * Day of a month. Must be from 1 to 31 and valid for the year and month.
   */
  day: number;

  private static weekdays = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  ];

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  /**
   * Converts a JS date to a PlainDate. WARNING: this will use the local timezone,
   * if you want to use the UTC date, see fromUTCJSDate()
   */
  static fromJSDate(jsDate: Date): PlainDate {
    return new PlainDate(
      jsDate.getFullYear(),
      jsDate.getMonth() + 1,
      jsDate.getDate(),
    );
  }

  /**
   * Converts a JS date to a PlainDate. WARNING: this will use the UTC timezone,
   * if you want to use the UTC date, see fromJSDate()
   */
  static fromUTCJSDate(jsDate: Date): PlainDate {
    return new PlainDate(
      jsDate.getUTCFullYear(),
      jsDate.getUTCMonth() + 1,
      jsDate.getUTCDate(),
    );
  }

  /**
   * Converts a ISO date string to a PlainDate.
   * If provided, a fallback date will be used if the date is not valid.
   */
  static fromISOString(isoString: string, fallback?: PlainDate): PlainDate {
    function handleError(errormsg: string, fallback?: PlainDate) {
      if (fallback) {
        return fallback;
      }
      else {
        throw new Error(errormsg);
      }
    }

    const vals = isoString.split('-');
    if (vals.length !== 3) {
      return handleError(`Expression '${isoString}' is not a valid ISO string`, fallback);
    }

    if (!isIntegerString(vals[0])) {
      return handleError(`Expression '${vals[0]}' in '${isoString}' is not valid`, fallback);
    }
    if (!isIntegerString(vals[1])) {
      return handleError(`Expression '${vals[1]}' in '${isoString}' is not valid`, fallback);
    }
    if (!isIntegerString(vals[2])) {
      return handleError(`Expression '${vals[2]}' in '${isoString}' is not valid`, fallback);
    }

    const out = new PlainDate(
      parseInt(vals[0]),
      parseInt(vals[1]),
      parseInt(vals[2])
    );
    if (out.isValid()) {
      return out;
    }
    else {
      return handleError(`Expression '${isoString}' is not a valid date`, fallback);
    }
  }

  /**
   * Returns the number of days in each month for a given year.
   * Accounts for leap years.
   */
  static daysInMonth(year: number): number[] {
    return [
      31,
      PlainDate.isLeapYear(year) ? 29 : 28,
      31, 30, 31, 30,
      31, 31, 30, 31, 30, 31,
    ];
  }

  /**
   * Returns true if a given year is a leap year.
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Returns the current PlainDate based on the local timezone.
   * Can be overridden in tests using a custom today function.
   */
  static today(today: () => Date = () => new Date()): PlainDate {
    const jsDate = today();
    return new PlainDate(jsDate.getFullYear(), jsDate.getMonth() + 1, jsDate.getDate());
  }

  /**
   * Checks if the current PlainDate represents a valid calendar date.
   */
  isValid(): boolean {
    if (this.year < 1 || this.month < 1 || this.month > 12 || this.day < 1) {
      return false;
    }

    const daysInMonth = PlainDate.daysInMonth(this.year)[this.month - 1];
    return this.day <= daysInMonth;
  }

  /**
   * Formats the date in the universal format: 'YYYY-MM-DD'.
   */
  toISOString(): string {
    const day = this.day < 10 ? `0${this.day}` : this.day;
    const month = this.month < 10 ? `0${this.month}` : this.month;
    return `${this.year}-${month}-${day}`;
  }

  /**
   * Adds a specified number of days to the current date.
   */
  addDays(days: number): PlainDate {
    if (days < 0) {
      return this.subDays(-days);
    }

    let {year, month, day} = this;

    while (days > 0) {
      const monthDays = PlainDate.daysInMonth(year)[month - 1];
      if (day + days > monthDays) {
        days -= monthDays - day + 1;
        day = 1;
        month++;
        if (month > 12) {
          month = 1;
          year++;
        }
      }
      else {
        day += days;
        days = 0;
      }
    }

    return new PlainDate(year, month, day);
  }

  /**
   * Subtracts a specified number of days from the current date.
   */
  subDays(days: number): PlainDate {
    if (days < 0) {
      return this.addDays(-days);
    }

    let {year, month, day} = this;

    while (days > 0) {
      if (day > days) {
        day -= days;
        days = 0;
      }
      else {
        days -= day;
        month--;
        if (month < 1) {
          month = 12;
          year--;
        }
        day = PlainDate.daysInMonth(year)[month - 1];
      }
    }

    return new PlainDate(year, month, day);
  }

  /**
   * Returns the day of the week as an enum for the current date.
   * @see DayOfWeek
   */
  getDayOfWeek(): DayOfWeek {
    const referenceDate = new PlainDate(1970, 1, 1);
    const referenceDayIndex = 4; // Thursday
    const daysDifference = referenceDate.getDaysDifference(this);
    return (referenceDayIndex + daysDifference) % 7;
  }

  /**
   * Returns the day of the week as a string for the current date.
   */
  getDayOfWeekStr(): string {
    return PlainDate.weekdays[this.getDayOfWeek()];
  }

  /**
   * Calculates the total number of days between the current date
   * and another date.
   */
  getDaysDifference(to: PlainDate): number {
    let totalDays = 0;

    if (this.isAfter(to)) {
      return -to.getDaysDifference(this);
    }

    if (this.year === to.year) {
      if (this.month === to.month) {
        return to.day - this.day;
      }
      else {
        totalDays += PlainDate.daysInMonth(this.year)[this.month - 1] - this.day;
        for (let m = this.month; m < to.month - 1; m++) {
          totalDays += PlainDate.daysInMonth(this.year)[m];
        }
        totalDays += to.day;
      }
    }
    else {
      totalDays += this.getDaysDifference(new PlainDate(this.year, 12, 31)) + 1;
      for (let y = this.year + 1; y < to.year; y++) {
        totalDays += PlainDate.isLeapYear(y) ? 366 : 365;
      }
      totalDays += new PlainDate(to.year, 1, 1).getDaysDifference(to);
    }

    return totalDays;
  }

  /**
   * Returns true if the current date is equal to another date.
   */
  isEqual(date: PlainDate): boolean {
    return this.year === date.year && this.month === date.month && this.day === date.day;
  }

  /**
   * Returns true if the current date is before another date.
   */
  isBefore(date: PlainDate): boolean {
    if (this.year !== date.year) {
      return this.year < date.year;
    }

    if (this.month !== date.month) {
      return this.month < date.month;
    }

    return this.day < date.day;
  }

  /**
   * Returns true if the current date is after another date.
   */
  isAfter(date: PlainDate): boolean {
    return !this.isBefore(date) && !this.isEqual(date);
  }

  /**
   * Returns true if the current date is before or equal to another date.
   */
  isBeforeOrEqual(date: PlainDate): boolean {
    return this.isBefore(date) || this.isEqual(date);
  }

  /**
   * Returns true if the current date is after or equal to another date.
   */
  isAfterOrEqual(date: PlainDate): boolean {
    return this.isAfter(date) || this.isEqual(date);
  }

  /**
   * Returns true if the current date is within a specified date range, inclusive.
   */
  isInInterval(from: PlainDate, to: PlainDate): boolean {
    if (to.isBefore(from)) {
      return this.isInInterval(to, from);
    }
    return this.isAfterOrEqual(from) && this.isBeforeOrEqual(to);
  }
}

function isIntegerString(value: string): boolean {
    const num = Number(value);
    return Number.isInteger(num) && (value === String(num) || value === String(`0${num}`));
}
