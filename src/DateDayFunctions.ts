import { DateDay } from './types';

const dateDayFunctions = {
  isGreaterThan(a: DateDay, b: DateDay) {
    return (
      a.year > b.year ||
      (a.year === b.year &&
        (a.month > b.month || (a.month === b.month && a.day > b.day)))
    );
  },
  isLessThan(a: DateDay, b: DateDay) {
    return (
      a.year < b.year ||
      (a.year === b.year &&
        (a.month < b.month || (a.month === b.month && a.day < b.day)))
    );
  },
  isEqual(a: DateDay, b: DateDay) {
    return a.year === b.year && a.month === b.month && a.day === b.day;
  },
  isGreaterOrEqual(a: DateDay, b: DateDay) {
    return !this.isLessThan(a, b);
  },
  isLessOrEqual(a: DateDay, b: DateDay) {
    return !this.isGreaterThan(a, b);
  },
  today(): DateDay {
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      day: new Date().getDate()
    };
  },
  nowUTC(): DateDay {
    return {
      year: new Date().getUTCFullYear(),
      month: new Date().getUTCMonth(),
      day: new Date().getUTCDate()
    };
  }
};

export default dateDayFunctions;
