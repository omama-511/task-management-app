import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../core/services/task.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskList implements OnInit {

  tasks$: Observable<Task[]>;

  constructor(private taskService: TaskService) {
    this.tasks$ = this.taskService.tasksObservable$;
  }

  ngOnInit(): void {
    this.taskService.getTasks();
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe();
    }
  }
}