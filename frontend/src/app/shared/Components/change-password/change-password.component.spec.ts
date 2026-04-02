/** @vitest-environment jsdom */
import { ChangePasswordDialog } from './change-password.component';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormBuilder } from '@angular/forms';

describe('ChangePasswordDialog (Unit Test)', () => {
  let component: ChangePasswordDialog;
  let authServiceMock: { changePassword: ReturnType<typeof vi.fn> };
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  const fb = new FormBuilder();

  beforeEach(() => {
    authServiceMock = {
      changePassword: vi.fn().mockReturnValue(of({}))
    };
    dialogRefMock = {
      close: vi.fn()
    };
    component = new ChangePasswordDialog(
      fb, 
      authServiceMock as unknown as import('../../../core/services/auth.service').AuthService, 
      dialogRefMock as unknown as import('@angular/material/dialog').MatDialogRef<ChangePasswordDialog>
    );
  });

  it('should validate password matching', () => {
    component.passwordForm.patchValue({
      newPassword: 'password123',
      confirmPassword: 'different'
    });
    expect(component.passwordForm.hasError('mismatch')).toBe(true);

    component.passwordForm.patchValue({ confirmPassword: 'password123' });
    expect(component.passwordForm.hasError('mismatch')).toBe(false);
  });

  it('should submit valid form successfully', () => {
    component.passwordForm.patchValue({
      currentPassword: 'old',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.onSubmit();

    expect(authServiceMock.changePassword).toHaveBeenCalledWith('old', 'newPassword123');
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('should handle incorrect current password error', () => {
    const errorResponse = { error: { detail: 'Incorrect current password' } };
    authServiceMock.changePassword.mockReturnValue(throwError(() => errorResponse));

    component.passwordForm.patchValue({
      currentPassword: 'wrong',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.onSubmit();

    expect(component.passwordForm.get('currentPassword')?.hasError('incorrect')).toBe(true);
    expect(component.errorMessage).toBe('');
  });

  it('should handle other submission errors', () => {
    const errorResponse = { error: { detail: 'Server Error' } };
    authServiceMock.changePassword.mockReturnValue(throwError(() => errorResponse));

    component.passwordForm.patchValue({
      currentPassword: 'old',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.onSubmit();

    expect(component.errorMessage).toBe('Server Error');
  });

  it('should toggle password visibility', () => {
    expect(component.hideCurrent).toBe(true);
    component.hideCurrent = !component.hideCurrent;
    expect(component.hideCurrent).toBe(false);
    
    expect(component.hideNew).toBe(true);
    component.hideNew = !component.hideNew;
    expect(component.hideNew).toBe(false);

    expect(component.hideConfirm).toBe(true);
    component.hideConfirm = !component.hideConfirm;
    expect(component.hideConfirm).toBe(false);
  });

  it('should not submit if form is invalid', () => {
    component.passwordForm.get('currentPassword')?.setValue('');
    component.onSubmit();
    expect(authServiceMock.changePassword).not.toHaveBeenCalled();
  });
  
  it('should handle generic error', () => {
    authServiceMock.changePassword.mockReturnValue(throwError(() => ({})));
    // Make form valid first
    component.passwordForm.patchValue({
      currentPassword: 'old',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123'
    });
    component.onSubmit();
    expect(component.errorMessage).toContain('Failed to change password');
  });
});