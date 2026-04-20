import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './success-page.component.html',
  styleUrl: './success-page.component.css'
})
export class SuccessPageComponent {

  constructor(private route: ActivatedRoute, private router: Router) { }

  id: string = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    });
  }

}
