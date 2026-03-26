import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Components
import { Navbar } from './Components/navbar/navbar';

// Pipes
import { DateFormatPipe } from './pipes/date-format-pipe';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    Navbar,
    DateFormatPipe
  ],
  exports: [
    Navbar,
    DateFormatPipe
  ]
})
export class SharedModule { }