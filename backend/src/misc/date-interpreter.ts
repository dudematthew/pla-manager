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

  private parseHour(input: string): number | null {
    const hourMatch = input.match(/(\d{1,2})/);
    if (hourMatch) {
      const hour = parseInt(hourMatch[1], 10);
      if (!isNaN(hour) && hour >= 0 && hour <= 23) {
        return hour;
      }
    }
    return null;
  }

  private parseTime(input: string): [number, number] | null {
    const timeMatch = input.match(/o\s(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10);
      if (
        !isNaN(hour) && hour >= 0 && hour <= 23 &&
        !isNaN(minute) && minute >= 0 && minute <= 59
      ) {
        return [hour, minute];
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

  public parse(input: string): Date | null {
    const lowerInput = input.toLowerCase();
  
    if (lowerInput.includes('dzisiaj')) {
      if (lowerInput.includes('za')) {
        const hoursToAdd = parseInt((lowerInput.match(/\d+/) || ['0'])[0], 10);
        if (!isNaN(hoursToAdd)) {
          return this.addHours(this.now, hoursToAdd);
        }
      } else {
        return this.now;
      }
    }
  
    if (lowerInput.includes('jutro')) {
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          const tomorrow = this.addDays(this.now, 1);
          return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hour, minute);
        }
      } else {
        const tomorrow = this.addDays(this.now, 1);
        return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      }
    }
  
    if (lowerInput.includes('pojutrze')) {
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          const dayAfterTomorrow = this.addDays(this.now, 2);
          return new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), hour, minute);
        }
      } else {
        const dayAfterTomorrow = this.addDays(this.now, 2);
        return new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate());
      }
    }
  
    const dayOfWeek = this.parseDayOfWeek(lowerInput);
    if (dayOfWeek !== null) {
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          const day = (dayOfWeek - this.now.getDay() + 7) % 7;
          const targetDate = this.addDays(this.now, day);
          return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, minute);
        }
      } else {
        const day = (dayOfWeek - this.now.getDay() + 7) % 7;
        const targetDate = this.addDays(this.now, day);
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      }
    }
  
    const simpleDate = this.parseSimpleDate(lowerInput);
    if (simpleDate !== null) {
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          return new Date(simpleDate.getFullYear(), simpleDate.getMonth(), simpleDate.getDate(), hour, minute);
        }
      } else {
        return simpleDate;
      }
    }
  
    return null;
  }
}
