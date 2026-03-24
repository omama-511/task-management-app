import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: false
})
export class Login implements OnInit {

  errorMessage = '';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

  submit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: (err) => this.errorMessage = err.error?.detail || 'Login failed'
    });
  }
}