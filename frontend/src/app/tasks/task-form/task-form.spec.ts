/** @vitest-environment jsdom */
import { TaskForm } from './task-form';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('TaskForm (Unit Test)', () => {
  let component: TaskForm;
  let taskServiceMock: {
    getTaskById: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    createTask: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let activatedRouteMock: { params: unknown };
  const fb = new FormBuilder();

  beforeEach(() => {
    taskServiceMock = {
      getTaskById: vi.fn().mockReturnValue(of({ title: 'Existing', priority: 'High', completed: true })),
      updateTask: vi.fn().mockReturnValue(of({})),
      createTask: vi.fn().mockReturnValue(of({}))
    };
    routerMock = { navigate: vi.fn() };
    activatedRouteMock = { params: of({ id: '1' }) };
  });

  it('should initialize empty form when no taskId', () => {
    activatedRouteMock = { params: of({}) }; // No id
    component = new TaskForm(fb, taskServiceMock as unknown as TaskService, activatedRouteMock as unknown as ActivatedRoute, routerMock as unknown as Router);
    component.ngOnInit();
    
    expect(component.taskForm.value.title).toBe('');
    expect(taskServiceMock.getTaskById).not.toHaveBeenCalled();
  });

  it('should load task in edit mode', () => {
    component = new TaskForm(fb, taskServiceMock as unknown as TaskService, activatedRouteMock as unknown as ActivatedRoute, routerMock as unknown as Router);
    component.ngOnInit();

    expect(taskServiceMock.getTaskById).toHaveBeenCalledWith('1');
    expect(component.taskForm.value.title).toBe('Existing');
  });

  it('should create new task', () => {
    activatedRouteMock = { params: of({}) }; // Create mode
    component = new TaskForm(fb, taskServiceMock as unknown as TaskService, activatedRouteMock as unknown as ActivatedRoute, routerMock as unknown as Router);
    component.ngOnInit();
    component.taskForm.patchValue({ title: 'New', priority: 'Medium' });
    component.submit();

    expect(taskServiceMock.createTask).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should update existing task', () => {
    component = new TaskForm(fb, taskServiceMock as unknown as TaskService, activatedRouteMock as unknown as ActivatedRoute, routerMock as unknown as Router);
    component.ngOnInit();
    component.submit();

    expect(taskServiceMock.updateTask).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should not submit if invalid', () => {
    activatedRouteMock = { params: of({}) };
    component = new TaskForm(fb, taskServiceMock as unknown as TaskService, activatedRouteMock as unknown as ActivatedRoute, routerMock as unknown as Router);
    component.ngOnInit();
    // title is required, default is empty
    component.submit();

    expect(taskServiceMock.createTask).not.toHaveBeenCalled();
    expect(taskServiceMock.updateTask).not.toHaveBeenCalled();
  });
});
