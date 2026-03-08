import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShiftService {
  private shifts = ['First', 'Night', 'Second'];

  /**
   * Get anchor date based on selected weekday.
   *
   * The user picks the day of the week when the *shift cycle changes* (e.g. Saturday).
   * The actual "anchor" used for computing shifts is the **day after the most recent
   * occurrence of that weekday**, because the new shift runs starting the day after
   * the change day.
   *
   * Example: if the change day is Saturday and today is Friday, the anchor becomes
   * the Sunday after the previous Saturday; if today is Saturday, the anchor becomes
   * the next day (Sunday).
   */
  getAnchorDate(selectedWeekday: number): Date {
    const today = new Date();
    const todayDay = today.getDay();

    if (todayDay === selectedWeekday) {
      // anchor = today - 6 days (to Sunday)
      return new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    } else {
      // most recent past selectedWeekday
      let diff = todayDay - selectedWeekday;
      if (diff < 0) diff += 7;
      return new Date(today.getTime() - diff * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Calculate the shift index that will be active on the anchor date.
   *
   * The caller supplies either the current shift (when the selected weekday is not
   * today) or the previous shift (when the selected weekday *is* today), and this
   * method advances that index by a whole number of weeks to land on the anchor.
   *
   * @param selectedWeekday weekday used to compute the anchor (see `getAnchorDate`)
   * @param todayWeekday current weekday (new Date().getDay())
   * @param currentShiftIndex shift currently running today (required if weekdays differ)
   * @param previousShiftIndex shift that just finished when the selected weekday is today
   * @param anchorDate optional precomputed anchor; if not provided it will be derived
   */
  resolveShiftIndex(
    selectedWeekday: number,
    todayWeekday: number,
    currentShiftIndex?: number,
    previousShiftIndex?: number,
    anchorDate?: Date,
  ): number {
    if (selectedWeekday === todayWeekday) {
      // user was asked for the previous shift
      return previousShiftIndex!;
    } else {
      return currentShiftIndex!;
    }
  }

  /** Get shift for any selected date */
  getShiftForDate(
    date: Date,
    anchorDate: Date,
    shiftIndexAtAnchor: number,
    selectedWeekday: number,
  ): string {
    // Selected weekday OFF
    if (date.getDay() === selectedWeekday) {
      return 'OFF';
    }

    const diffDays = Math.floor((date.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));

    const weeksPassed = Math.floor(diffDays / 7);

    const index =
      (((shiftIndexAtAnchor + weeksPassed) % this.shifts.length) + this.shifts.length) %
      this.shifts.length;
    return this.shifts[index];
  }
}
