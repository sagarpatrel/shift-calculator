import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgForOf, NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ShiftService } from '../../../services/shift.service';

@Component({
  selector: 'app-shift-config',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgForOf,
    NgIf,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
  ],
  templateUrl: './shift-config.html',
  styleUrls: ['./shift-config.css'],
})
export class ShiftConfigComponent implements OnInit {
  username = '';
  selectedWeekday?: number;

  // saved configuration used to calculate shifts
  anchorDate: Date | null = null;
  shiftIndexAtAnchor = 0;

  get today(): number {
    return new Date().getDay();
  }

  currentShiftIndex?: number;
  previousShiftIndex?: number;

  // track the month the calendar should start at (always now)
  calendarMonth: Date | null = null;

  // optional UI state for clicked date
  selectedDate?: Date;
  selectedShift?: string;

  weekdays = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
  ];

  constructor(
    private shiftService: ShiftService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const cfg = sessionStorage.getItem('userShiftConfig');
    if (cfg) {
      try {
        const parsed = JSON.parse(cfg);
        this.username = parsed.username || '';
        this.selectedWeekday = parsed.selectedWeekday ?? this.selectedWeekday;
        this.shiftIndexAtAnchor = parsed.shiftIndexAtAnchor ?? 0;
        this.calendarMonth = new Date();
        // Restore the saved anchor directly — updateCalendar() would
        // recompute it from today which is correct for live use, but on
        // reload we also need currentShiftIndex restored. Since we stored
        // the already-resolved shiftIndexAtAnchor, just use it directly.
        this.anchorDate = parsed.anchorDate ? new Date(parsed.anchorDate) : null;
      } catch (e) {
        console.error('Failed to parse stored shift config', e);
      }
    }
    // If no sessionStorage, updateCalendar needs the user to have filled the form.
    // If sessionStorage was loaded, still call updateCalendar so anchorDate is
    // recalculated for today (in case days have passed since last save).
    if (this.selectedWeekday !== undefined) {
      this.updateCalendar();
      // Toggle to force mat-calendar remount with correct dateClass
      const savedAnchor = this.anchorDate;
      this.anchorDate = null;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.anchorDate = savedAnchor;
        this.calendarMonth = new Date();
        this.cdr.detectChanges();
      }, 0);
    }
  }

  updateCalendar() {
    if (this.selectedWeekday === undefined) return;

    const weekday = this.selectedWeekday!;
    const today = new Date();
    const anchorDate = this.shiftService.getAnchorDate(weekday);

    let shiftIndexAtAnchor = this.shiftService.resolveShiftIndex(
      weekday,
      today.getDay(),
      this.currentShiftIndex,
      this.previousShiftIndex,
      anchorDate,
    );

    if (shiftIndexAtAnchor === undefined || shiftIndexAtAnchor === null) {
      shiftIndexAtAnchor = 0;
    }

    this.anchorDate = anchorDate;
    this.shiftIndexAtAnchor = shiftIndexAtAnchor;
    this.calendarMonth = new Date(); // Force calendar re-render
    this.cdr.detectChanges();
  }

  saveConfig() {
    if (this.selectedWeekday === undefined) {
      alert('Please select a weekday');
      return;
    }

    this.updateCalendar();

    // persist for later reloads
    sessionStorage.setItem(
      'userShiftConfig',
      JSON.stringify({
        username: this.username,
        selectedWeekday: this.selectedWeekday!,
        anchorDate: this.anchorDate!.toISOString(),
        shiftIndexAtAnchor: this.shiftIndexAtAnchor,
      }),
    );

    alert('Shift configuration saved ✅');

    // Force mat-calendar to fully remount so dateClass re-runs on every cell.
    // Simply calling detectChanges() is not enough — mat-calendar caches the
    // dateClass output. Toggling anchorDate null→value destroys and recreates
    // the calendar via *ngIf, which guarantees fresh class evaluation.
    const savedAnchor = this.anchorDate;
    this.anchorDate = null;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.anchorDate = savedAnchor;
      this.calendarMonth = new Date();
      this.cdr.detectChanges();
    }, 0);
  }

  // determine the CSS class for any date dynamically
  dateClass = (d: Date) => {
    if (!this.anchorDate || this.selectedWeekday === undefined) {
      return '';
    }
    const shift = this.shiftService.getShiftForDate(
      d,
      this.anchorDate,
      this.shiftIndexAtAnchor,
      this.selectedWeekday,
    );
    switch (shift) {
      case 'First':
        return 'shift-first';
      case 'Night':
        return 'shift-night';
      case 'Second':
        return 'shift-second';
      case 'OFF':
        return 'shift-off';
      default:
        return '';
    }
  };

  onDateSelected(date: Date | null) {
    if (!date) {
      this.selectedDate = undefined;
      this.selectedShift = undefined;
      return;
    }

    this.selectedDate = date;
    if (this.anchorDate && this.selectedWeekday !== undefined) {
      this.selectedShift = this.shiftService.getShiftForDate(
        date,
        this.anchorDate,
        this.shiftIndexAtAnchor,
        this.selectedWeekday,
      );
    }
  }

  // format a date as yyyy-mm-dd in local zone to avoid timezone mismatches
  private localKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
