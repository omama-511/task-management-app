/** @vitest-environment jsdom */
import { TaskDetail } from './task-detail';
import { of } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';

describe('TaskDetail (Unit Test)', () => {
  let component: TaskDetail;
  let taskServiceMock: { getTaskById: ReturnType<typeof vi.fn> };
  let activatedRouteMock: { snapshot: { params: { id: string } } };

  it('should initialize and load task detail', () => {
    taskServiceMock = {
      getTaskById: vi.fn().mockReturnValue(of({
        id: '1', title: 'Test Task', priority: 'High', completed: false
      }))
    };

    activatedRouteMock = {
      snapshot: {
        params: { id: '1' }
      }
    };

    component = new TaskDetail(
      taskServiceMock as unknown as import('../../core/services/task.service').TaskService, 
      activatedRouteMock as unknown as import('@angular/router').ActivatedRoute
    );
    component.ngOnInit();

    expect(taskServiceMock.getTaskById).toHaveBeenCalledWith('1');
    component.task$?.subscribe(task => {
      expect(task.title).toBe('Test Task');
    });
  });
});
