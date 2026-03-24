import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Task {
    id?: string;
    title: string;
    description?: string;
    completed?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class TaskService {

    private tasks$ = new BehaviorSubject<Task[]>([]); // State management using behaviour subject
    tasksObservable$ = this.tasks$.asObservable();

    private apiUrl = `${environment.apiUrl}/tasks`;

    constructor(private http: HttpClient) { }

    // Fetch all tasks
    getTasks(): void {
        this.http.get<Task[]>(this.apiUrl)
            .pipe(
                map(tasks => tasks || [])
            )
            .subscribe(tasks => this.tasks$.next(tasks));
    }

    // Get a single task by ID
    getTaskById(id: string): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${id}`);
    }

    // Create new task
    createTask(task: Task): Observable<Task> {
        return this.http.post<Task>(this.apiUrl, task).pipe(
            map(newTask => {
                const current = this.tasks$.value;
                this.tasks$.next([...current, newTask]);
                return newTask;
            })
        );
    }

    // Update task
    updateTask(id: string, task: Task): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${id}`, task).pipe(
            map(updatedTask => {
                const current = this.tasks$.value.map(t => t.id === id ? updatedTask : t);
                this.tasks$.next(current);
                return updatedTask;
            })
        );
    }

    // Delete task
    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            map(() => {
                const current = this.tasks$.value.filter(t => t.id !== id);
                this.tasks$.next(current);
            })
        );
    }
}
