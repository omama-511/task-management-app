import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { Login } from './login/login';
import { Register } from './register/register';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { loginGuard } from '../core/guards/login-guard';

const routes: Routes = [
    {
        path: 'login',
        component: Login,
        canActivate: [loginGuard]
    },
    {
        path: 'register',
        component: Register,
        canActivate: [loginGuard]
    }
];

@NgModule({
    declarations: [Login, Register],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    exports: [RouterModule]
})
export class AuthModule { }