import { Component, OnInit, HostListener } from '@angular/core';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CalculatorComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'dice-probability-calculator';
  isDarkMode = false;
  showScrollToTop = false;

  ngOnInit() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show button after scrolling down 300px
    this.showScrollToTop = window.pageYOffset > 300;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
