import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/Components/navbar/navbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialog } from './shared/Components/change-password/change-password.component';
import { EditProfileDialog } from './shared/Components/edit-profile/edit-profile.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, MatSidenavModule, MatButtonModule, MatIconModule, MatDividerModule, CommonModule, MatDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = signal('Task Management App');

  constructor(
    public auth: AuthService,
    private dialog: MatDialog,
    private themeService: ThemeService
  ) { }

  openChangePassword() {
    this.dialog.open(ChangePasswordDialog, {
      width: '400px'
    });
  }

  openEditProfile() {
    const user = this.auth.currentUserValue;
    if (!user) return; // Prevent opening dialong if no user is found

    const dialogRef = this.dialog.open(EditProfileDialog, {
      width: '400px',
      data: { name: user.name, email: user.email }
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
}