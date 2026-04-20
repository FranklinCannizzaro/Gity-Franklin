import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-magnifier',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './magnifier.component.html',
  styleUrl: './magnifier.component.css'
})
export class MagnifierComponent {

  @Input() contentTemplate: TemplateRef<any> | null = null;

  @ViewChild('container') container!: ElementRef<HTMLDivElement>;

  showMagnifier = false;
  magnifierX = 0;
  magnifierY = 0;
  zoom = 3;
  magnifierRadius = 50;
  zoomX = 0;
  zoomY = 0;

  onDivMouseMove(event: MouseEvent) {
    const rect = this.container.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.magnifierX = x - this.magnifierRadius;
    this.magnifierY = y - this.magnifierRadius;

    this.zoomX = x * this.zoom - this.magnifierRadius;
    this.zoomY = y * this.zoom - this.magnifierRadius;
  }

}
