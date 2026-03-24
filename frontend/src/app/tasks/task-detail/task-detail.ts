import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../core/services/task.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-detail',
  standalone: false,
  templateUrl: './task-detail.html',
  styleUrls: ['./task-detail.css']
})
export class TaskDetail implements OnInit {

  task$?: Observable<Task>;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.task$ = this.taskService.getTaskById(id);
  }
}