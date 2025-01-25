# PlainDate
A lightweight, simple library for handling dates without the ~~headaches~~ complexities of dates. 

It allows you to work with "plain" dates, where the focus is entirely on the day, month, and year, leaving out 
complications such as hours, minutes, seconds, timezones, and other intricacies.

The library provides a unique class, `PlainDate`, with helper functions to compare dates, convert from/to ISO strings or 
vanilla JS `Date` objects.

This library is perfect for applications that need basic date operations, such as adding days, 
checking if a date is within a range, or converting dates from ISO strings.  
If you need more complex operations (*e.g.* working with time, timezones, or other detailed date manipulations), 
you should consider using PlainDate alongside libraries like [date-fns](https://www.npmjs.com/package/date-fns), 
[luxon](https://www.npmjs.com/package/luxon), or [moment.js](https://www.npmjs.com/package/moment).

## Key Features
- **No Timezone**: All dates are based purely on the calendar day, month, and year, without the complications of timezones.
- **Simple Date Arithmetic**: Add or subtract days from a date.
- **ISO String Parsing**: Parse ISO date strings into a PlainDate object.
- **Date Comparison**: Compare dates (before, after, equal).
- **Date Range Check**: Check if a date is within a given date range.
- **Leap Year Handling**: Automatically accounts for leap years when adding/subtracting days or working with months.
- **Fully tested**: See the Codecov page for details.
- **No dependency**: Because no one likes that.

## Installation
```bash
npm install @xureilab/plain-date
```

## Why use PlainDate ?
If you've ever worked with dates in any programming language, you're probably familiar 
with the ~~headaches~~ complexity involved.   
Timezones, varying days in months, leap years, even leap seconds... there are countless pitfalls that can trip you up.

However, in many cases, you don't **need** or even **want** a full-fledged `Date` object.  
What you really need is a reliable object that represents **a day** — just **a day**, not a precise moment in time.

This library was built with that purpose in mind: to offer a simple, intuitive way of handling **days** without all the 
complications of timezones, time, and calendar nuances.

Features that would require arbitrary decisions or assumptions aren't — and won't —
be implemented.  
For example:

- **Adding one month to `2023-03-31`**: Should it return `2023-04-30` or `2023-05-01`?
- **Adding one year to `2024-02-29`**: Should it return `2025-02-28` or `2025-03-01`?

These are subjective design choices that depend on the specific needs of your software.
Instead of forcing you into one decision, this library leaves those kinds of questions to be solved in
your own application logic.

The end goal of this library is to **simplify date handling**. The fewer complications there are, the easier it is to 
mentally process and reason about dates. `PlainDate` is designed to make working with dates is more straightforward for 
developers, by focusing on the essentials.
In the end, it makes it easier to handle dates without getting bogged down by unnecessary complexity, and avoid unexpected corner cases.

Ultimately, the simpler you can make the problem, the easier it becomes to think about it.

## Usage
### Create a PlainDate
#### Explicitly
```typescript
import { PlainDate } from '@xureilab/plain-date';

const date = new PlainDate(2024, 2, 15);
console.log(date); // PlainDate { year: 2024, month: 2, day: 15 }
```

#### Convert from ISO String
```typescript
const date = PlainDate.fromISOString('2024-02-15');
console.log(date); // PlainDate { year: 2024, month: 2, day: 15 }
```
If the ISO string is invalid, it will throw an error, unless you provide a fallback `PlainDate`:
```typescript
const fallbackDate = new PlainDate(2023, 12, 31);
const date = PlainDate.fromISOString('invalid-date', fallbackDate);
console.log(date); // PlainDate { year: 2023, month: 12, day: 31 }
```

#### Get the current day (using local timezone)
```typescript
const date = PlainDate.today();
```

#### From a JS `Date` object (using local timezone)
```typescript
const jsDate = new Date(/* ... */);
const date = PlainDate.fromJSDate(jsDate);
```

#### From a JS `Date` object (using UTC timezone)
```typescript
const jsDate = new Date(/* ... */);
const date = PlainDate.fromUTCJSDate(jsDate);
```


### Adding or Subtracting Days
You can easily add or subtract days from a PlainDate:
```typescript
const date = new PlainDate(2024, 2, 15);
const newDate = date.addDays(5); // Adds 5 days
console.log(newDate); // PlainDate { year: 2024, month: 2, day: 20 }

const previousDate = date.subDays(10); // Subtracts 10 days
console.log(previousDate); // PlainDate { year: 2024, month: 2, day: 5 }
```

### Checking Validity
You can check if a date is valid by calling the isValid() method:
```typescript
const date = new PlainDate(2024, 2, 29);
console.log(date.isValid()); // true (2024 is a leap year)
```

### Comparing Dates
```typescript
const date1 = new PlainDate(2024, 2, 15);
const date2 = new PlainDate(2024, 2, 16);
console.log(date1.isEqual(date2));  // false
console.log(date1.isBefore(date2)); // true
console.log(date1.isBeforeOrEqual(date2));  // true
console.log(date1.isAfter(date2));  // false
console.log(date1.isAfterOrEqual(date2));  // false
```

### Date Range Check (inclusive)
```typescript
const date = new PlainDate(2024, 2, 15);
const from = new PlainDate(2024, 2, 10);
const to = new PlainDate(2024, 2, 20);

console.log(date.isInInterval(from, to)); // true
````

### Getting the difference in days
```typescript
console.log(new PlainDate(2024, 2, 15).getDaysDifference(new PlainDate(2024, 2, 1))); // -14
console.log(new PlainDate(2024, 3, 5).getDaysDifference(new PlainDate(2024, 3, 20))); // 15
console.log(new PlainDate(2024, 1, 15).getDaysDifference(new PlainDate(2025, 1, 15))); // 366 since 2024 is a leap year
```

### Getting the Day of the Week
```typescript
const date = new PlainDate(2024, 2, 15);
console.log(date.getDayOfWeek()); // 5 (Friday)
console.log(date.getDayOfWeekStr()); // "Friday"
```

## License
MIT License. See the [LICENSE](./LICENSE) file for details.
