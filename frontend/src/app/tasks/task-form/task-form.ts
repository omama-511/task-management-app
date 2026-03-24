import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService, Task } from '../../core/services/task.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskForm implements OnInit {

  taskId?: string;

  taskForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      completed: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const taskId: string = params['id'];
      if (taskId) {
        this.taskId = taskId;
        this.taskService.getTaskById(taskId).subscribe(task => {
          this.taskForm.patchValue(task);
        });
      }
    });
  }

  submit() {
    if (this.taskForm.invalid) return;

    const task: Task = this.taskForm.value as Task;

    if (this.taskId) {
      this.taskService.updateTask(this.taskId, task).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    } else {
      this.taskService.createTask(task).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    }
  }
}
