export default class DateInterpreter {
  private now: Date;

  constructor(now: Date = new Date()) {
    this.now = now;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(date.getDate() + days);
    return result;
  }

  private addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(date.getHours() + hours);
    return result;
  }

  private addMinutes(date: Date, minutes: number): Date {
    const result = new Date(date);
    result.setMinutes(date.getMinutes() + minutes);
    return result;
  }

  private parseTime(input: string): [number, number] | null {
    const timeMatch = input.match(/(\d{1,2})(?::(\d{2}))?(?:\sam)?/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return [hours, minutes];
      }
    }
    return null;
  }

  private parseDayOfWeek(input: string): number | null {
    const daysOfWeek = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (input.includes(daysOfWeek[i])) {
        return i;
      }
    }
    return null;
  }

  private parseSimpleDate(input: string): Date | null {
    const [day, month, year] = input.split('.').map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day <= 31 && month <= 12) {
      let parsedYear = year;
      if (year < 100) {
        parsedYear += 2000;
      }
      const parsedDate = new Date(parsedYear, month - 1, day);
      return parsedDate;
    }
    return null;
  }

  private parseDayAndTime(input: string, targetDay: Date): Date | null {
    const timeMatch = input.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const targetTime = new Date(targetDay);
        targetTime.setHours(hours, minutes);
        return targetTime;
      }
    }
    return null;
  }

  public parse(input: string): Date | null {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('dzisiaj')) {
      if (lowerInput.includes('za')) {
        const hoursToAdd = parseInt((lowerInput.match(/\d+/) || ['0'])[0], 10);
        if (!isNaN(hoursToAdd)) {
          return this.addHours(this.now, hoursToAdd);
        }
      } else if (lowerInput.includes('o')) {
        const timeMatch = lowerInput.match(/\d+:\d+/);
        if (timeMatch) {
          const [hours, minutes] = timeMatch[0].split(':').map(Number);
          if (!isNaN(hours) && !isNaN(minutes)) {
            const todayWithTime = new Date(this.now);
            todayWithTime.setHours(hours);
            todayWithTime.setMinutes(minutes);
            return todayWithTime;
          }
        }
      } else if (lowerInput.includes('wieczorem')) {
        const eveningTime = new Date(this.now);
        eveningTime.setHours(19, 0);
        return eveningTime;
      }
      const noonTime = new Date(this.now);
      noonTime.setHours(12, 0);
      return noonTime;
    }

    if (lowerInput.includes('jutro')) {
      if (lowerInput.includes('rano')) {
        const tomorrowMorning = new Date(this.addDays(this.now, 1));
        tomorrowMorning.setHours(8, 0);
        return tomorrowMorning;
      }
      const tomorrowNoon = new Date(this.addDays(this.now, 1));
      tomorrowNoon.setHours(12, 0);
      return tomorrowNoon;
    }

    if (lowerInput.includes('pojutrze')) {
      const dayAfterTomorrow = new Date(this.addDays(this.now, 2));
      dayAfterTomorrow.setHours(12, 0);
      return dayAfterTomorrow;
    }

    const dayOfWeekIndex = this.parseDayOfWeek(lowerInput);
    if (dayOfWeekIndex !== null) {
      const targetDay = this.addDays(this.now, (dayOfWeekIndex - this.now.getDay() + 7) % 7);

      // Sprawdź, czy istnieje określona godzina
      const timeMatch = lowerInput.match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const targetTime = new Date(targetDay);
          targetTime.setHours(hours, minutes);
          return targetTime;
        }
      }

      // Jeśli godzina nie jest określona, zwróć datę zgodną z dniem tygodnia
      return targetDay;
    }

    if (lowerInput.includes('za')) {
      if (lowerInput.includes('minut')) {
        const minutesToAdd = parseInt((lowerInput.match(/\d+/) || ['0'])[0], 10);
        if (!isNaN(minutesToAdd)) {
          return this.addMinutes(this.now, minutesToAdd);
        }
      } else if (lowerInput.includes('godzin')) {
        const hoursToAdd = parseInt((lowerInput.match(/\d+/) || ['0'])[0], 10);
        if (!isNaN(hoursToAdd)) {
          return this.addHours(this.now, hoursToAdd);
        }
      }
    }

    const timeMatch = lowerInput.match(/o\s(\d{1,2})/);
    if (timeMatch) {
      const time = this.parseTime(`o ${timeMatch[1]}`);
      if (time) {
        const [hours, minutes] = time;
        const targetTime = new Date(this.now);
        targetTime.setHours(hours, minutes);
        return targetTime;
      }
    }

    if (lowerInput.match(/^\d{1,2}\.\d{1,2}(\.\d{2}|\.\d{4})?(\s\d{1,2}:\d{2})?$/)) {
      const parsedDate = this.parseSimpleDate(lowerInput);
      if (parsedDate) {
        return parsedDate;
      }
    }

    return null;
  }
}
