import { 
  formatIdWithHyphens, 
  removeHyphensFromId, 
  isValidUniversalId,
  parseUniversalId 
} from './idFormatter';

describe('ID Formatter Utility', () => {
  describe('formatIdWithHyphens', () => {
    test('formats loan ID correctly', () => {
      const id = 'LN250001';
      const formatted = formatIdWithHyphens(id);
      expect(formatted).toBe('LN-25-0001');
    });

    test('formats payment ID correctly', () => {
      const id = 'PM250123';
      const formatted = formatIdWithHyphens(id);
      expect(formatted).toBe('PM-25-0123');
    });

    test('formats expense ID correctly', () => {
      const id = 'EX250042';
      const formatted = formatIdWithHyphens(id);
      expect(formatted).toBe('EX-25-0042');
    });

    test('returns original if ID is wrong length', () => {
      const id = 'SHORT';
      const formatted = formatIdWithHyphens(id);
      expect(formatted).toBe('SHORT');
    });

    test('returns original if ID is null or undefined', () => {
      expect(formatIdWithHyphens(null)).toBe(null);
      expect(formatIdWithHyphens(undefined)).toBe(undefined);
    });
  });

  describe('removeHyphensFromId', () => {
    test('removes hyphens from formatted ID', () => {
      const formattedId = 'LN-25-0005';
      const cleaned = removeHyphensFromId(formattedId);
      expect(cleaned).toBe('LN250005');
    });

    test('handles ID without hyphens', () => {
      const id = 'LN250005';
      const cleaned = removeHyphensFromId(id);
      expect(cleaned).toBe('LN250005');
    });

    test('returns original if null or undefined', () => {
      expect(removeHyphensFromId(null)).toBe(null);
      expect(removeHyphensFromId(undefined)).toBe(undefined);
    });
  });

  describe('isValidUniversalId', () => {
    test('validates correct loan ID', () => {
      expect(isValidUniversalId('LN250005')).toBe(true);
    });

    test('validates correct formatted ID', () => {
      expect(isValidUniversalId('LN-25-0005')).toBe(true);
    });

    test('rejects wrong length ID', () => {
      expect(isValidUniversalId('SHORT')).toBe(false);
      expect(isValidUniversalId('TOOLONGID123')).toBe(false);
    });

    test('rejects ID with non-digit year/sequence', () => {
      expect(isValidUniversalId('LNAB0005')).toBe(false);
    });

    test('rejects null or undefined', () => {
      expect(isValidUniversalId(null)).toBe(false);
      expect(isValidUniversalId(undefined)).toBe(false);
    });
  });

  describe('parseUniversalId', () => {
    test('parses loan ID correctly', () => {
      const id = 'LN250005';
      const parsed = parseUniversalId(id);
      
      expect(parsed).not.toBe(null);
      expect(parsed.prefix).toBe('LN');
      expect(parsed.year).toBe('25');
      expect(parsed.sequence).toBe('0005');
      expect(parsed.formatted).toBe('LN-25-0005');
      expect(parsed.raw).toBe('LN250005');
    });

    test('parses formatted ID correctly', () => {
      const id = 'PM-25-0123';
      const parsed = parseUniversalId(id);
      
      expect(parsed).not.toBe(null);
      expect(parsed.prefix).toBe('PM');
      expect(parsed.year).toBe('25');
      expect(parsed.sequence).toBe('0123');
    });

    test('returns null for invalid ID', () => {
      const parsed = parseUniversalId('INVALID');
      expect(parsed).toBe(null);
    });

    test('returns null for null or undefined', () => {
      expect(parseUniversalId(null)).toBe(null);
      expect(parseUniversalId(undefined)).toBe(null);
    });
  });

  describe('roundtrip conversion', () => {
    test('format and remove hyphens returns original', () => {
      const original = 'LN250005';
      const formatted = formatIdWithHyphens(original);
      const back = removeHyphensFromId(formatted);
      expect(back).toBe(original);
    });
  });
});
