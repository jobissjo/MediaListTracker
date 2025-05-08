import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.isAuthenticated$ = new Observable<boolean>(observer => {
      this.authService.getAuthState().subscribe(state => {
        observer.next(state.isAuthenticated);
      });
    });
    
    this.currentUser$ = new Observable<User | null>(observer => {
      this.authService.getAuthState().subscribe(state => {
        observer.next(state.user);
      });
    });
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
