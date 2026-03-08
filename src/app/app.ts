import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ShiftConfigComponent } from './components/shift-config/shift-config/shift-config';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ShiftConfigComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('myShift');
}
