import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../core/services/task.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskList implements OnInit {

  searchQuery$ = new BehaviorSubject<string>('');
  statusFilter$ = new BehaviorSubject<string>('all');
  dateFilter$ = new BehaviorSubject<string>('all');
  customDate$ = new BehaviorSubject<string>('');
  rangeStart$ = new BehaviorSubject<string>('');
  rangeEnd$ = new BehaviorSubject<string>('');
  sortOrder$ = new BehaviorSubject<string>('newest');

  filteredTasks$: Observable<Task[]>;
  totalTasks$: Observable<number>;
  completedTasks$: Observable<number>;
  pendingTasks$: Observable<number>;

  constructor(private taskService: TaskService) {
    this.filteredTasks$ = combineLatest([
      this.taskService.tasksObservable$,
      this.searchQuery$,
      this.statusFilter$,
      this.dateFilter$,
      this.sortOrder$,
      this.customDate$,
      this.rangeStart$,
      this.rangeEnd$
    ]).pipe(
      map(([tasks, search, status, date, sort, customDate, rangeStart, rangeEnd]: [Task[], string, string, string, string, string, string, string]) => {
        const filtered = tasks.filter(task => {
          // Status filter
          let statusMatch = true;
          if (status === 'completed') statusMatch = !!task.completed;
          if (status === 'pending') statusMatch = !task.completed;

          // Search filter
          let searchMatch = true;
          if (search) {
            const lowSearch = search.toLowerCase();
            const titleMatch = task.title.toLowerCase().includes(lowSearch);
            const descMatch = task.description?.toLowerCase().includes(lowSearch) || false;
            searchMatch = titleMatch || descMatch;
          }

          // Date filter
          let dateMatch = true;
          if (date !== 'all') {
            if (!task.created_at) {
              dateMatch = false;
            } else {
              const taskDate = new Date(task.created_at);
              taskDate.setHours(0, 0, 0, 0);
              const taskTime = taskDate.getTime();
              
              const now = new Date();
              const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
              const yesterdayStart = todayStart - 86400000;
              
              const currentDay = now.getDay();
              const thisWeekStart = todayStart - (currentDay * 86400000);
              const lastWeekStart = thisWeekStart - (7 * 86400000);
              
              const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
              const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
              const lastMonthEnd = thisMonthStart - 1;
              
              const thisYearStart = new Date(now.getFullYear(), 0, 1).getTime();
              const lastYearStart = new Date(now.getFullYear() - 1, 0, 1).getTime();
              const lastYearEnd = thisYearStart - 1;
              
              if (date === 'today') dateMatch = taskTime === todayStart;
              else if (date === 'yesterday') dateMatch = taskTime === yesterdayStart;
              else if (date === 'this_week') dateMatch = taskTime >= thisWeekStart;
              else if (date === 'last_week') dateMatch = taskTime >= lastWeekStart && taskTime < thisWeekStart;
              else if (date === 'this_month') dateMatch = taskTime >= thisMonthStart;
              else if (date === 'last_month') dateMatch = taskTime >= lastMonthStart && taskTime <= lastMonthEnd;
              else if (date === 'this_year') dateMatch = taskTime >= thisYearStart;
              else if (date === 'last_year') dateMatch = taskTime >= lastYearStart && taskTime <= lastYearEnd;
              else if (date === 'custom' && customDate) {
                 const target = new Date(customDate);
                 target.setHours(0,0,0,0);
                 dateMatch = taskTime === target.getTime();
              } else if (date === 'custom' && !customDate) {
                 dateMatch = true; // Wait for them to pick one
              } else if (date === 'range') {
                 if (rangeStart && rangeEnd) {
                     const start = new Date(rangeStart);
                     start.setHours(0,0,0,0);
                     const end = new Date(rangeEnd);
                     end.setHours(23,59,59,999);
                     dateMatch = taskTime >= start.getTime() && taskTime <= end.getTime();
                 } else {
                     dateMatch = true; // Wait for them to pick
                 }
              } else {
                 dateMatch = false; // Explicit failure if date string isn't recognized
              }
            }
          }

          return statusMatch && searchMatch && dateMatch;
        });

        // Add Sorting logic here
        return filtered.sort((a: Task, b: Task) => {
          // Pinned tasks always on top
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
          }

          if (sort === 'az') {
            return a.title.localeCompare(b.title);
          }

          if (sort === 'priority') {
            const priorityWeight: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
            const weightA = priorityWeight[a.priority || 'Low'] || 1;
            const weightB = priorityWeight[b.priority || 'Low'] || 1;
            return weightB - weightA; // High priority first
          }

          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

          if (sort === 'oldest') {
            return dateA - dateB;
          }
          // Default to newest
          return dateB - dateA;
        });
      })
    );

    this.totalTasks$ = this.taskService.tasksObservable$.pipe(map(tasks => tasks.length));
    this.completedTasks$ = this.taskService.tasksObservable$.pipe(map(tasks => tasks.filter(t => t.completed).length));
    this.pendingTasks$ = this.taskService.tasksObservable$.pipe(map(tasks => tasks.filter(t => !t.completed).length));
  }

  ngOnInit(): void {
    this.taskService.getTasks();
  }

  togglePin(task: Task) {
    if (task.id) {
      this.taskService.togglePin(task.id, !!task.pinned).subscribe();
    }
  }

  onSearchChange(value: string) {
    this.searchQuery$.next(value);
  }

  onStatusChange(value: string) {
    this.statusFilter$.next(value);
  }

  onDateChange(value: string) {
    this.dateFilter$.next(value);
  }

  onCustomDateChange(value: any) {
    if (value instanceof Date) {
      this.customDate$.next(value.toISOString());
    } else {
      this.customDate$.next(value);
    }
  }

  onRangeChange(start: any, end: any) {
    if (start) {
      this.rangeStart$.next(start instanceof Date ? start.toISOString() : start);
    }
    if (end) {
      this.rangeEnd$.next(end instanceof Date ? end.toISOString() : end);
    }
  }

  onSortChange(value: string) {
    this.sortOrder$.next(value);
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe();
    }
  }
}