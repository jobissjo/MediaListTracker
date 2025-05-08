import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';
import { User } from '../../core/models/user.model';
import { v4 as uuidv4 } from 'uuid';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly USERS_KEY = 'users';
  
  private authState$ = new BehaviorSubject<AuthState>({
    user: null,
    isAuthenticated: false
  });
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {
    this.initializeAuthState();
  }
  
  /**
   * Initialize authentication state from storage
   */
  private initializeAuthState(): void {
    const token = this.storageService.getItem<string>(this.TOKEN_KEY);
    const user = this.storageService.getItem<User>(this.USER_KEY);
    
    if (token && user) {
      this.authState$.next({
        user,
        isAuthenticated: true
      });
    }
  }
  
  /**
   * Get authentication state as observable
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState$.getValue().isAuthenticated;
  }
  
  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState$.getValue().user;
  }
  
  /**
   * Get current user ID
   */
  getCurrentUserId(): string {
    const user = this.getCurrentUser();
    return user ? user.id : '';
  }
  
  /**
   * Register a new user
   */
  register(username: string, email: string, password: string): Observable<User> {
    // Get existing users or initialize empty array
    const users = this.storageService.getItem<User[]>(this.USERS_KEY) || [];
    
    // Check if user with same email or username already exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() || 
      u.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save user to storage
    users.push(newUser);
    this.storageService.setItem(this.USERS_KEY, users);
    
    // Simulate API call with delay
    return of(newUser).pipe(
      delay(500),
      tap(() => {
        // Auto-login after registration
        this.setAuthState(newUser);
      })
    );
  }
  
  /**
   * Login user
   */
  login(email: string, password: string): Observable<User> {
    // Get existing users
    const users = this.storageService.getItem<User[]>(this.USERS_KEY) || [];
    
    // Find user by email (case insensitive)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, you would check the password hash here
    // For this mock implementation, we'll just accept any password
    
    // Simulate API call with delay
    return of(user).pipe(
      delay(800),
      tap(user => {
        this.setAuthState(user);
      })
    );
  }
  
  /**
   * Set authentication state
   */
  private setAuthState(user: User): void {
    // Generate mock token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Save token and user to storage
    this.storageService.setItem(this.TOKEN_KEY, token);
    this.storageService.setItem(this.USER_KEY, user);
    
    // Update auth state
    this.authState$.next({
      user,
      isAuthenticated: true
    });
  }
  
  /**
   * Logout user
   */
  logout(): void {
    // Clear auth data from storage
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);
    
    // Reset auth state
    this.authState$.next({
      user: null,
      isAuthenticated: false
    });
    
    // Navigate to login page
    this.router.navigate(['/auth/login']);
  }
}
