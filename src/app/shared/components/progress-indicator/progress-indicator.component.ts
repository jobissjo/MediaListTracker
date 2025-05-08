import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-indicator',
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss']
})
export class ProgressIndicatorComponent {
  @Input() value = 0;
  @Input() color = '#2196f3';
  @Input() height = 6;
  @Input() animate = true;
  @Input() showLabel = false;
  
  constructor() { }
  
  get progressStyle() {
    return {
      width: `${this.value}%`,
      backgroundColor: this.color,
      height: `${this.height}px`,
      transition: this.animate ? 'width 0.3s ease-in-out' : 'none'
    };
  }
  
  get containerStyle() {
    return {
      height: `${this.height}px`
    };
  }
}
