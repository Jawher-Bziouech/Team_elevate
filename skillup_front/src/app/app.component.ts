import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'skillup_front';

  constructor(
    public authService: AuthService,
    public router: Router  // ← CHANGEZ DE private À public
  ) {}
}