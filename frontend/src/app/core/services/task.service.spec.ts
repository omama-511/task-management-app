import { TaskService, Task } from './task.service';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MOCK_TASKS, MOCK_TASK } from './mock-data.spec';

describe('TaskService (Unit Test)', () => {
    let service: TaskService;
    let httpMock: {
      get: ReturnType<typeof vi.fn>;
      post: ReturnType<typeof vi.fn>;
      put: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        httpMock = {
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn()
        };
        service = new TaskService(httpMock as unknown as import('@angular/common/http').HttpClient);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch tasks and update BehaviorSubject', () => {
        httpMock.get.mockReturnValue(of(MOCK_TASKS));
        service.getTasks();

        expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/tasks'));
        service.tasksObservable$.subscribe(tasks => {
            expect(tasks).toEqual(MOCK_TASKS);
        });
    });

    it('should handle null/undefined response in getTasks', () => {
        httpMock.get.mockReturnValue(of(null));
        service.getTasks();

        service.tasksObservable$.subscribe(tasks => {
            expect(tasks).toEqual([]);
        });
    });

    it('should get a single task by ID', () => {
        const mockTask = MOCK_TASKS[0];
        httpMock.get.mockReturnValue(of(mockTask));

        service.getTaskById('1').subscribe(task => {
            expect(task).toEqual(mockTask);
        });

        expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/tasks/1'));
    });

    it('should create a task and update local state', () => {
        const newTask: Task = { title: 'New Task', priority: 'High' };
        const savedTask: Task = { ...newTask, id: '3' };
        httpMock.post.mockReturnValue(of(savedTask));

        service.createTask(newTask).subscribe(task => {
            expect(task).toEqual(savedTask);
        });

        expect(httpMock.post).toHaveBeenCalledWith(expect.stringContaining('/tasks'), newTask);
        service.tasksObservable$.subscribe(tasks => {
            expect(tasks).toContainEqual(savedTask);
        });
    });

    it('should update a task and update local state', () => {
        service['tasks$'].next(MOCK_TASKS);
        const updatedTask: Task = { ...MOCK_TASKS[0], title: 'Updated' };
        httpMock.put.mockReturnValue(of(updatedTask));

        service.updateTask('1', updatedTask).subscribe(task => {
            expect(task).toEqual(updatedTask);
        });

        expect(httpMock.put).toHaveBeenCalledWith(expect.stringContaining('/tasks/1'), updatedTask);
        service.tasksObservable$.subscribe(tasks => {
            const t = tasks.find(x => x.id === '1');
            expect(t?.title).toBe('Updated');
        });
    });

    it('should delete a task and update local state', () => {
        service['tasks$'].next(MOCK_TASKS);
        httpMock.delete.mockReturnValue(of({}));

        service.deleteTask('1').subscribe();

        expect(httpMock.delete).toHaveBeenCalledWith(expect.stringContaining('/tasks/1'));
        service.tasksObservable$.subscribe(tasks => {
            expect(tasks.length).toBe(2);
            expect(tasks.find(x => x.id === '1')).toBeUndefined();
        });
    });

    it('should toggle pin and update local state', () => {
        service['tasks$'].next(MOCK_TASKS);
        const task = MOCK_TASKS[0];
        const updatedTask = { ...task, pinned: true };
        httpMock.put.mockReturnValue(of(updatedTask));

        service.togglePin('1', false).subscribe(res => {
            expect(res).toEqual(updatedTask);
        });

        expect(httpMock.put).toHaveBeenCalledWith(expect.stringContaining('/tasks/1'), { pinned: true });
        service.tasksObservable$.subscribe(tasks => {
            const t = tasks.find(x => x.id === '1');
            expect(t?.pinned).toBe(true);
        });
    });
});
