import { Component, OnInit } from '@angular/core';
import { CalculatorComponent } from './components/calculator/calculator.component';

@Component({
  selector: 'app-root',
  imports: [CalculatorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'dice-probability-calculator';
  isDarkMode = false;

  ngOnInit() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
