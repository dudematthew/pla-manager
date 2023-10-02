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
    const timeMatch = input.match(/o\s(\d{1,2})(?::(\d{2}))?/);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = parseInt(timeMatch[2], 10) || 0; // Default to 0 if minutes are not specified
      if (
        !isNaN(hour) && hour >= 0 && hour <= 23 &&
        !isNaN(minute) && minute >= 0 && minute <= 59
      ) {
        return [hour, minute];
      }
    } else if (input.includes('północy')) {
      return [0, 0];
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
    const [datePart, timePart] = input.split(' ');
    const [day, month, year] = datePart.split('.').map(Number);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year) && day <= 31 && month <= 12) {
      let parsedYear = year;
      if (year < 100) {
        parsedYear += 2000;
      }
      const parsedDate = new Date(parsedYear, month - 1, day);
      if (timePart) {
        const [hour, minute] = timePart.split(':').map(Number);
        if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          parsedDate.setHours(hour, minute);
        }
      }
      return parsedDate;
    }
    return null;
  }

  public parse(input: string): Date | null {
    if (input === null || input === undefined) {
      return null;
    }

    const lowerInput = input.toLowerCase();
  
    console.log("Input:", input);
  
    if (lowerInput.includes('dzisiaj')) {
      console.log("Parsing 'dzisiaj'");
      if (lowerInput.includes('za')) {
        const hoursToAdd = parseInt((lowerInput.match(/\d+/) || ['0'])[0], 10);
        console.log("Hours to add:", hoursToAdd);
        if (!isNaN(hoursToAdd)) {
          const result = this.addHours(this.now, hoursToAdd);
          console.log("Returning current date with time:", result.getHours(), result.getMinutes());
          return result;
        }
      } else {
        console.log("Returning current date");
        return this.now;
      }
    }

    if (lowerInput.includes('za godzinę')) {
      console.log('Parsing "za godzinę"');
      const targetDate = this.addHours(this.now, 1);
      console.log('Returning target date:', targetDate);
      return targetDate;
    }

    if (lowerInput.includes('za minutę')) {
      console.log('Parsing "za minutę"');
      const targetDate = this.addMinutes(this.now, 1);
      console.log('Returning target date:', targetDate);
      return targetDate;
    }

    if (lowerInput.includes('za')) {
      const minutesMatch = lowerInput.match(/za\s(\d+)\s?minut/);
      if (minutesMatch) {
        const minutesToAdd = parseInt(minutesMatch[1], 10);
        console.log(`Parsing "za ${minutesToAdd} minut"`);
        const futureDate = new Date(this.now.getTime() + minutesToAdd * 60 * 1000);
        console.log(`Returning date in ${minutesToAdd} minutes:`, futureDate);
        return futureDate;
      }
    }

    if (lowerInput.includes('za')) {
      const daysMatch = lowerInput.match(/za\s(\d+)\s?dni/);
      if (daysMatch) {
        const daysToAdd = parseInt(daysMatch[1], 10);
        console.log(`Parsing "za ${daysToAdd} dni"`);
        if (lowerInput.includes('o')) {
          const timeMatch = this.parseTime(lowerInput);
          if (timeMatch) {
            const [hour, minute] = timeMatch;
            console.log(`Returning date in ${daysToAdd} days with time:`, hour, minute);
            const dateInFuture = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() + daysToAdd, hour, minute);
            return dateInFuture;
          }
        }
      }
    }

    if (lowerInput.includes('za')) {
      const hoursMatch = lowerInput.match(/za\s(\d+)\s?godzin/);
      if (hoursMatch) {
        const hoursToAdd = parseInt(hoursMatch[1], 10);
        console.log(`Parsing "za ${hoursToAdd} godzin"`);
        const futureDate = new Date(this.now.getTime() + hoursToAdd * 60 * 60 * 1000);
        console.log(`Returning date in ${hoursToAdd} hours:`, futureDate);
        return futureDate;
      }
    }

    if (lowerInput.includes('za')) {
      const minutesMatch = lowerInput.match(/za\s(\d+)\s?minuty/);
      if (minutesMatch) {
        const minutesToAdd = parseInt(minutesMatch[1], 10);
        console.log(`Parsing "za ${minutesToAdd} minuty"`);
        const futureDate = new Date(this.now.getTime() + minutesToAdd * 60 * 1000);
        console.log(`Returning date in ${minutesToAdd} minutes:`, futureDate);
        return futureDate;
      }

      const hoursMatch = lowerInput.match(/za\s(\d+)\s?godzinę/);
      if (hoursMatch) {
        const hoursToAdd = parseInt(hoursMatch[1], 10);
        console.log(`Parsing "za ${hoursToAdd} godzinę"`);
        const futureDate = new Date(this.now.getTime() + hoursToAdd * 60 * 60 * 1000);
        console.log(`Returning date in ${hoursToAdd} hours:`, futureDate);
        return futureDate;
      }
    }

    if (lowerInput.includes('za tydzień')) {
      console.log('Parsing "za tydzień"');
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          console.log('Returning date in a week with time:', hour, minute);
          const dateInAWeek = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate() + 7, hour, minute);
          return dateInAWeek;
        }
      }
    }
  
    if (lowerInput.includes('jutro')) {
      console.log("Parsing 'jutro'");
      const timeMatch = this.parseTime(lowerInput);
      if (timeMatch) {
        const [hour, minute] = timeMatch;
        const tomorrow = this.addDays(this.now, 1);
        console.log("Returning tomorrow with time:", hour, minute);
        return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hour, minute);
      } else {
        const tomorrow = this.addDays(this.now, 1);
        console.log("Returning tomorrow:", tomorrow);
        return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
      }
    }
  
    if (lowerInput.includes('pojutrze')) {
      console.log("Parsing 'pojutrze'");
      const timeMatch = this.parseTime(lowerInput);
      if (timeMatch) {
        const [hour, minute] = timeMatch;
        const dayAfterTomorrow = this.addDays(this.now, 2);
        console.log("Returning day after tomorrow with time:", hour, minute);
        return new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), hour, minute);
      } else {
        const dayAfterTomorrow = this.addDays(this.now, 2);
        console.log("Returning day after tomorrow:", dayAfterTomorrow);
        return new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate());
      }
    }

    const dayOfWeek = this.parseDayOfWeek(lowerInput);
    if (dayOfWeek !== null) {
      console.log('Parsing day of week:', dayOfWeek);
      if (lowerInput.includes('o')) {
        const timeMatch = this.parseTime(lowerInput);
        if (timeMatch) {
          const [hour, minute] = timeMatch;
          const day = (dayOfWeek - this.now.getDay() + 7) % 7;
          const targetDate = this.addDays(this.now, day);
          console.log('Returning target date with time:', hour, minute);
          return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), hour, minute);
        }
      } else {
        const day = (dayOfWeek - this.now.getDay() + 7) % 7;
        const targetDate = this.addDays(this.now, day);
        console.log('Returning target date:', targetDate);
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      }
    }

    const simpleDate = this.parseSimpleDate(lowerInput);
    if (simpleDate !== null) {
      console.log('Parsing simple date:', simpleDate);
      return simpleDate;
    }
  
    console.log("No valid date found");
    console.log("endDate:", null, "options.endDate:", input);
  
    return null;
  }
}
