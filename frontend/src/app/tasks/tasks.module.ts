import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TaskList } from './task-list/task-list';
import { TaskDetail } from './task-detail/task-detail';
import { TaskForm } from './task-form/task-form';

// Shared
import { SharedModule } from '../shared/shared-module';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Guard
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        canActivate: [AuthGuard],
        children: [
            { path: '', component: TaskList },
            { path: 'new', component: TaskForm },
            { path: ':id', component: TaskDetail },
            { path: ':id/edit', component: TaskForm }
        ]
    }
];

@NgModule({
    declarations: [
        TaskList,
        TaskDetail,
        TaskForm
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes),   // ✅ routing defined here
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule
    ]
})
export class TasksModule { }