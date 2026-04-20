import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-video-dialog',
  standalone: true,
  imports: [MatDialogModule],
  templateUrl: './video-dialog.component.html',
  styleUrl: './video-dialog.component.css'
})
export class VideoDialogComponent {
   apiUrl = environment.apiUrl;
  constructor(@Inject(MAT_DIALOG_DATA) public videoUrl: string) {}
}
