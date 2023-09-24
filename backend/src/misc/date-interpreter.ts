import { DateTime } from 'ts-luxon';

export default class DateInterpreter {
  parse(dateString: string): Date | null {
    const today = DateTime.local(); // Get the current date and time

    // DD.MM HH:MM
    let result = DateTime.fromFormat(dateString, 'dd.MM HH:mm');
    if (result.isValid) {
      // Set the year to the current year
      result = result.set({ year: today.year });
      return result.toJSDate();
    }

    // HH:MM (today)
    result = DateTime.fromFormat(dateString, 'HH:mm');
    if (result.isValid) {
      // Set the year, month, and day to the current year, month, and day
      result = result.set({
        year: today.year,
        month: today.month,
        day: today.day,
      });
      return result.toJSDate();
    }

    return null;
  }
}
