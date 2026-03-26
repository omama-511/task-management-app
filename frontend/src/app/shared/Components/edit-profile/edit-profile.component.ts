import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileDialog {
  profileForm: FormGroup;
  errorMessage: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<EditProfileDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, email: string }
  ) {
    this.profileForm = this.fb.group({
      name: [data.name, [Validators.required, Validators.minLength(3)]],
      email: [data.email, [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    const { name, email } = this.profileForm.value;

    this.authService.updateProfile(name, email).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.detail || 'Failed to update profile. Please try again.';
      }
    });
  }
}
