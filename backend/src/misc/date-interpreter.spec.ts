import DateInterpreter from "./date-interpreter";

describe('DateInterpreter', () => {
  const dateInterpreter = new DateInterpreter();

  describe('parseTime', () => {
    it('should parse "Dziś o 4:00" correctly', () => {
      const result = dateInterpreter.parseTime('Dziś o 4:00');
      expect(result).toEqual({ hours: 4, minutes: 0 });
    });

    it('should parse "Jutro o 15:00" correctly', () => {
      const result = dateInterpreter.parseTime('Jutro o 15:00');
      expect(result).toEqual({ hours: 15, minutes: 0 });
    });
  });
});
