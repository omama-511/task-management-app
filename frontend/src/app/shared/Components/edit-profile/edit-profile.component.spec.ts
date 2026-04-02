/** @vitest-environment jsdom */
import { EditProfileDialog } from './edit-profile.component';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormBuilder } from '@angular/forms';

describe('EditProfileDialog (Unit Test)', () => {
  let component: EditProfileDialog;
  let authServiceMock: { updateProfile: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  const fb = new FormBuilder();
  const mockData = { name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    authServiceMock = {
      updateProfile: vi.fn().mockReturnValue(of({}))
    };
    dialogRefMock = {
      close: vi.fn()
    };
    component = new EditProfileDialog(
      fb, 
      authServiceMock as unknown as import('../../../core/services/auth.service').AuthService, 
      dialogRefMock as unknown as import('@angular/material/dialog').MatDialogRef<EditProfileDialog>, 
      mockData
    );
  });

  it('should initialize form with data', () => {
    expect(component.profileForm.value.name).toBe('Test User');
    expect(component.profileForm.value.email).toBe('test@example.com');
  });

  it('should validate form fields', () => {
    const nameControl = component.profileForm.get('name');
    const emailControl = component.profileForm.get('email');

    nameControl?.setValue('');
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('ab');
    expect(nameControl?.hasError('minlength')).toBe(true);

    emailControl?.setValue('invalid');
    expect(emailControl?.hasError('email')).toBe(true);
  });

  it('should submit valid form successfully', () => {
    component.profileForm.patchValue({ name: 'New Name', email: 'new@example.com' });
    component.onSubmit();

    expect(authServiceMock.updateProfile).toHaveBeenCalledWith('New Name', 'new@example.com');
    expect(component.isSubmitting).toBe(false);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should handle submission error', () => {
    const errorResponse = { error: { detail: 'Update failed' } };
    authServiceMock.updateProfile.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toBe('Update failed');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should not submit if form is invalid', () => {
    component.profileForm.get('name')?.setValue('');
    component.onSubmit();
    expect(authServiceMock.updateProfile).not.toHaveBeenCalled();
  });

  it('should handle submission error without detail', () => {
    authServiceMock.updateProfile.mockReturnValue(throwError(() => ({})));
    component.onSubmit();
    expect(component.errorMessage).toContain('Failed to update profile');
  });
});