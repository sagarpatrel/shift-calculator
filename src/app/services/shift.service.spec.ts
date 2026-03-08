import { TestBed } from '@angular/core/testing';
import { ShiftService } from './shift.service';

describe('ShiftService', () => {
  let svc: ShiftService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ShiftService] });
    svc = TestBed.inject(ShiftService);
  });

  it('should be created', () => {
    expect(svc).toBeTruthy();
  });

  describe('getAnchorDate', () => {
    it('returns the most recent past occurrence of the weekday', () => {
      // today is March 7 2026 Saturday (6)
      const anchorFri = svc.getAnchorDate(5); // Friday, most recent past Friday = March 6
      expect(anchorFri.getDate()).toBe(6);

      const anchorWed = svc.getAnchorDate(3); // Wednesday, most recent past Wednesday = March 4
      expect(anchorWed.getDate()).toBe(4);
    });
  });

  describe('resolveShiftIndex', () => {
    it('uses previous shift when selected weekday is today', () => {
      // today is Friday (5), selected=5, previousShiftIndex=1, shiftAtToday=1
      const idx = svc.resolveShiftIndex(5, 5, 0, 1);
      expect(idx).toBe(1);
    });

    it('uses current shift when selected weekday is not today', () => {
      // today March 6, anchor Feb 28 (7 days ago), diff_days=-6, weeks=-1, 0 + (-1) = -1 %3 =2
      const now = new Date();
      const anchor = new Date(now);
      anchor.setDate(now.getDate() - 7);

      const computed = svc.resolveShiftIndex(1, now.getDay(), 0, undefined, anchor);
      expect(computed).toBe(0);
    });
  });

  describe('getShiftForDate', () => {
    it('returns OFF on the selected weekday', () => {
      const anchor = new Date();
      const saturday = new Date(anchor);
      // move to next Saturday
      saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7));
      expect(svc.getShiftForDate(saturday, anchor, 0, 6)).toBe('OFF');
    });

    it('rotates through shifts weekly', () => {
      const anchor = new Date();
      const nextWeek = new Date(anchor);
      nextWeek.setDate(anchor.getDate() + 20); // two weeks later, not the selected weekday (Monday)
      const shift = svc.getShiftForDate(nextWeek, anchor, 1, 1);
      // after 2 weeks, index should be (1+2)%3 = 0 -> First
      expect(shift).toBe('First');
    });
  });
});
