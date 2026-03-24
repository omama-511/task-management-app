import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: false
})
export class Register {

  errorMessage = '';
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  submit() {
    if (this.registerForm.invalid) return;

    const { name, email, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }

    this.auth.register({ name, email, password }).subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: (err) => this.errorMessage = err.error?.detail || 'Registration failed'
    });
  }
}