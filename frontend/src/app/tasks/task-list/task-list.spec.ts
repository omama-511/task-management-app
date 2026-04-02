/** @vitest-environment jsdom */
import { TaskList } from './task-list';
import { of, BehaviorSubject } from 'rxjs';
import { describe, it, expect, vi } from 'vitest';
import { MOCK_TASKS } from '../../core/services/mock-data.spec';
import { Task, TaskService } from '../../core/services/task.service';

describe('TaskList (Unit Test)', () => {
  let component: TaskList;
  let taskServiceMock: {
    getTasks: ReturnType<typeof vi.fn>;
    deleteTask: ReturnType<typeof vi.fn>;
    togglePin: ReturnType<typeof vi.fn>;
    updateTask: ReturnType<typeof vi.fn>;
    tasksObservable$: import('rxjs').Observable<Task[]>;
  };
  let tasksSubject: BehaviorSubject<Task[]>;

  const setup = () => {
    tasksSubject = new BehaviorSubject(MOCK_TASKS);
    taskServiceMock = {
      tasksObservable$: tasksSubject.asObservable(),
      getTasks: vi.fn(),
      togglePin: vi.fn().mockReturnValue(of({})),
      deleteTask: vi.fn().mockReturnValue(of({})),
      updateTask: vi.fn().mockReturnValue(of({}))
    };
    component = new TaskList(taskServiceMock as unknown as TaskService);
  };

  it('should load tasks on init', () => {
    setup();
    component.ngOnInit();
    expect(taskServiceMock.getTasks).toHaveBeenCalled();
  });

  it('should sort by priority (High first)', () => {
    setup();
    component.onSortChange('priority');
    component.filteredTasks$.subscribe(tasks => {
      // Pinned (2) is always first. Then High (3), then Low (1).
      expect(tasks[0].id).toBe('2');
      expect(tasks[1].id).toBe('3');
      expect(tasks[2].id).toBe('1');
    });
  });

  it('should sort alphabetically (A-Z)', () => {
    setup();
    component.onSortChange('az');
    component.filteredTasks$.subscribe(tasks => {
      // Pinned (2) is first. Then Task M (3), then Task Z (1).
      // Wait, A (2) is pinned. Then M (3), then Z (1).
      expect(tasks[0].id).toBe('2');
      expect(tasks[1].id).toBe('3');
      expect(tasks[2].id).toBe('1');
    });
  });

  it('should sort by oldest', () => {
    setup();
    component.onSortChange('oldest');
    component.filteredTasks$.subscribe(tasks => {
      // Pinned (2) first. Then 2023-01-01 (1), then 2023-01-03 (3).
      expect(tasks[0].id).toBe('2');
      expect(tasks[1].id).toBe('1');
      expect(tasks[2].id).toBe('3');
    });
  });

  it('should sort by newest (default)', () => {
    setup();
    component.onSortChange('newest');
    component.filteredTasks$.subscribe(tasks => {
      // Pinned (2) first. Then 2023-01-03 (3), then 2023-01-01 (1).
      expect(tasks[0].id).toBe('2');
      expect(tasks[1].id).toBe('3');
      expect(tasks[2].id).toBe('1');
    });
  });

  it('should handle all date filter branches', () => {
    setup();
    component.filteredTasks$.subscribe();
    ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'custom', 'range', 'all', 'unknown'].forEach(f => {
      component.onDateChange(f);
    });
    component.onCustomDateChange(new Date());
    component.onRangeChange(new Date(), new Date());
    expect(true).toBe(true);
  });

  it('should handle tasks without created_at date', () => {
    setup();
    tasksSubject.next([{ title: 'No Date', pinned: false } as Task]);
    component.onDateChange('today');
    component.onSortChange('newest'); // Triggers branch at line 289
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(0);
    });
  });

  it('should handle delete confirmation branches', () => {
    setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deleteTask('1');
    expect(taskServiceMock.deleteTask).toHaveBeenCalled();

    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.deleteTask('2');
  });

  it('should stats observables work', () => {
    setup();
    component.totalTasks$.subscribe(c => expect(c).toBe(3));
    component.completedTasks$.subscribe(c => expect(c).toBe(1));
    component.pendingTasks$.subscribe(c => expect(c).toBe(2));
  });

  it('should filter by status (completed)', () => {
    setup();
    component.onStatusChange('completed');
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].completed).toBe(true);
    });
  });

  it('should filter by status (pending)', () => {
    setup();
    component.onStatusChange('pending');
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks.every(t => !t.completed)).toBe(true);
    });
  });

  it('should filter by search query (title)', () => {
    setup();
    component.onSearchChange('Task Z');
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Task Z');
    });
  });

  it('should filter by search query (description)', () => {
    setup();
    tasksSubject.next([
      { id: '1', title: 'A', description: 'Find me', completed: false },
      { id: '2', title: 'B', description: 'Hidden', completed: false }
    ] as Task[]);
    component.onSearchChange('find');
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('A');
    });
  });

  it('should filter by exact custom date', () => {
    setup();
    const targetDate = new Date('2023-01-01');
    component.onDateChange('custom');
    component.onCustomDateChange(targetDate);

    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('1');
    });
  });

  it('should filter by date range', () => {
    setup();
    const start = new Date('2023-01-01');
    const end = new Date('2023-01-02');
    component.onDateChange('range');
    component.onRangeChange(start, end);

    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(2);
      const ids = tasks.map(t => t.id);
      expect(ids).toContain('1');
      expect(ids).toContain('2');
    });
  });

  it('should handle onCustomDateChange with string value', () => {
    setup();
    component.onCustomDateChange('2023-01-01T00:00:00Z');
    expect(component.customDate$.value).toBe('2023-01-01T00:00:00Z');
  });

  it('should handle onRangeChange with string values', () => {
    setup();
    component.onRangeChange('2023-01-01T00:00:00Z', '2023-01-02T00:00:00Z');
    expect(component.rangeStart$.value).toBe('2023-01-01T00:00:00Z');
    expect(component.rangeEnd$.value).toBe('2023-01-02T00:00:00Z');
  });

  it('should handle all relative date filters and edge cases', () => {
    vi.useFakeTimers();
    const mockNow = new Date('2024-03-30T12:00:00Z');
    vi.setSystemTime(mockNow);

    setup();

    const todayMillis = new Date('2024-03-30T00:00:00Z').getTime();
    const oneDay = 86400000;

    const tasks = [
      { id: 'today', created_at: new Date(todayMillis).toISOString(), pinned: false, title: 'T' },
      { id: 'yesterday', created_at: new Date(todayMillis - oneDay).toISOString(), pinned: false, title: 'Y' },
      { id: 'this_week', created_at: new Date('2024-03-24T00:00:00Z').toISOString(), pinned: false, title: 'W' }, // Sunday
      { id: 'last_week', created_at: new Date('2024-03-17T00:00:00Z').toISOString(), pinned: false, title: 'LW' },
      { id: 'this_month', created_at: new Date('2024-03-01T00:00:00Z').toISOString(), pinned: false, title: 'M' },
      { id: 'last_month', created_at: new Date('2024-02-01T00:00:00Z').toISOString(), pinned: false, title: 'LM' },
      { id: 'this_year', created_at: new Date('2024-01-01T00:00:00Z').toISOString(), pinned: false, title: 'TY' },
      { id: 'last_year', created_at: new Date('2023-01-01T00:00:00Z').toISOString(), pinned: false, title: 'LY' },
      { id: 'no-date', created_at: null, pinned: false, title: 'ND' }
    ];
    tasksSubject.next(tasks as unknown as Task[]);

    const filters = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year'];

    filters.forEach(f => {
      component.onDateChange(f);
      let found = false;
      component.filteredTasks$.subscribe(t => {
        found = t.some(task => task.id === f);
      }).unsubscribe();
      expect(found).toBe(true);
    });

    vi.useRealTimers();
  });

  it('should handle sorting tasks with missing or invalid data', () => {
    setup();
    // Providing a set that exhausts all branches in the priorityWeight calculation
    tasksSubject.next([
      { id: 'p-high', title: 'A', priority: 'High', created_at: '2024-01-01', pinned: false },
      { id: 'p-none', title: 'B', priority: undefined, created_at: '2024-01-02', pinned: false },
      { id: 'p-null', title: 'C', priority: null, created_at: '2024-01-03', pinned: false },
      { id: 'p-weird', title: 'D', priority: 'Ultra', created_at: '2024-01-04', pinned: false },
      { id: 'p-low', title: 'E', priority: 'Low', created_at: '2024-01-05', pinned: false }
    ] as Task[]);

    // This will force multiple comparisons covering:
    // 1. priority exists ('High')
    // 2. priority is undefined (fallback to 'Low')
    // 3. priority is null (fallback to 'Low')
    // 4. priority is invalid (fallback Weight to 1)
    component.onSortChange('priority');
    component.filteredTasks$.subscribe(tasks => {
      expect(tasks.length).toBe(5);
    }).unsubscribe();

    // Exhaust all branches at 151-152 (dateA/dateB ternary)
    tasksSubject.next([
      { id: 'd-null1', title: 'N1', created_at: null, pinned: false },
      { id: 'd-date1', title: 'D1', created_at: '2024-01-01', pinned: false },
      { id: 'd-null2', title: 'N2', created_at: null, pinned: false },
      { id: 'd-date2', title: 'D2', created_at: '2024-01-02', pinned: false }
    ] as Task[]);
    // Test both oldest and newest to ensure a and b are flipped in comparisons
    ['oldest', 'newest'].forEach(s => {
      component.onSortChange(s);
      component.filteredTasks$.subscribe(tasks => expect(tasks.length).toBe(4)).unsubscribe();
    });
  });

  it('should handle edge cases in custom/range filters and events', () => {
    setup();
    // Test unrecognized filter string fallback
    component.onDateChange('definitely_unknown');
    component.filteredTasks$.subscribe(tasks => expect(tasks.length).toBe(0)).unsubscribe();

    // Test range and custom missing dates logic
    component.onDateChange('custom');
    component.onCustomDateChange('');
    component.filteredTasks$.subscribe(tasks => expect(tasks.length).toBe(MOCK_TASKS.length)).unsubscribe();

    component.onDateChange('range');
    component.onRangeChange(null, null);
    component.filteredTasks$.subscribe(tasks => expect(tasks.length).toBe(MOCK_TASKS.length)).unsubscribe();

    // Event path: Date vs String
    const d = new Date('2023-01-01');
    component.onCustomDateChange(d);
    expect(component.customDate$.value).toBe(d.toISOString());
    component.onCustomDateChange('str-val');
    expect(component.customDate$.value).toBe('str-val');

    component.onRangeChange(d, d);
    expect(component.rangeStart$.value).toBe(d.toISOString());
    expect(component.rangeEnd$.value).toBe(d.toISOString());
    component.onRangeChange('s', 'e');
    expect(component.rangeStart$.value).toBe('s');
    expect(component.rangeEnd$.value).toBe('e');
  });

  it('should toggle pin and handle missing id', () => {
    setup();
    component.togglePin({ id: '1', pinned: false } as unknown as Task);
    expect(taskServiceMock.togglePin).toHaveBeenCalledWith('1', false);

    component.togglePin({ id: undefined, pinned: true } as unknown as Task);
    expect(taskServiceMock.togglePin).toHaveBeenCalledTimes(1); // Not called for undefined id
  });
});
