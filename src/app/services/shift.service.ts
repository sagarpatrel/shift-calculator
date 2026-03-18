import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private shifts = ['First', 'Night', 'Second'];

  /**
   * Returns the anchor date: the day AFTER the most recent occurrence of
   * the selected weekday (because the new shift cycle starts the day after
   * the change day).
   *
   * Examples (today = Wednesday):
   *   selectedWeekday = Saturday → last Saturday was 4 days ago → anchor = Sunday (3 days ago)
   *   selectedWeekday = Wednesday (today) → anchor = tomorrow (Thursday)
   */
  getAnchorDate(selectedWeekday: number): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay();

    // How many days back is the most recent selectedWeekday? (0 = today)
    const daysBack = (todayDay - selectedWeekday + 7) % 7;

    // Most recent selectedWeekday
    const lastChangeDay = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Anchor = the day AFTER the change day
    return new Date(lastChangeDay.getTime() + 24 * 60 * 60 * 1000);
  }

  /**
   * Back-calculates the shift index that was active on the anchor date,
   * given what is running today (or what just finished if today IS the change day).
   */
  resolveShiftIndex(
    selectedWeekday: number,
    todayWeekday: number,
    currentShiftIndex?: number,
    previousShiftIndex?: number,
    anchorDate?: Date,
  ): number {
    const n = this.shifts.length;
    const anchor = anchorDate ?? this.getAnchorDate(selectedWeekday);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedWeekday === todayWeekday) {
      // Today IS the change day. Anchor = tomorrow.
      // Shift starting tomorrow = previousShiftIndex + 1
      return (((previousShiftIndex! + 1) % n) + n) % n;
    } else {
      // Back-calculate: how many whole weeks from anchor to today?
      const diffDays = Math.round((today.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
      const weeksPassed = Math.floor(diffDays / 7);
      return (((currentShiftIndex! - weeksPassed) % n) + n) % n;
    }
  }

  /** Returns the shift name for any calendar date. */
  getShiftForDate(
    date: Date,
    anchorDate: Date,
    shiftIndexAtAnchor: number,
    selectedWeekday: number,
  ): string {
    // The change day is always OFF
    if (date.getDay() === selectedWeekday) {
      return 'OFF';
    }

    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const a = new Date(anchorDate);
    a.setHours(0, 0, 0, 0);

    const diffDays = Math.round((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(diffDays / 7);

    const index =
      (((shiftIndexAtAnchor + weeksPassed) % this.shifts.length) + this.shifts.length) %
      this.shifts.length;

    return this.shifts[index];
  }
}
