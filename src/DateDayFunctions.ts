import { DateDay } from "./types";

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
};

export default dateDayFunctions;
