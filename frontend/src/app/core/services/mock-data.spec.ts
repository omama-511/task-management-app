import { describe, it, expect } from 'vitest';
import type { Task } from './task.service';

export const MOCK_USER = {
  token: 'fake-token',
  name: 'John Doe',
  email: 'john@example.com'
};

export const MOCK_PROFILE = {
  name: 'Profile Name',
  email: 'profile@example.com'
};

export const MOCK_UPDATED_USER = {
  name: 'Updated Name',
  email: 'updated@example.com'
};

export const MOCK_TASKS: Task[] = [
  { 
    id: '1', 
    title: 'Task Z', 
    description: 'Description Z',
    completed: false, 
    created_at: '2023-01-01T10:00:00Z', 
    priority: 'Low' as const, 
    pinned: false 
  },
  { 
    id: '2', 
    title: 'Task A', 
    description: 'Description A',
    completed: true, 
    created_at: '2023-01-02T10:00:00Z', 
    priority: 'Medium' as const, 
    pinned: true 
  },
  { 
    id: '3', 
    title: 'Task M', 
    description: 'Description M',
    completed: false, 
    created_at: '2023-01-03T10:00:00Z', 
    priority: 'High' as const, 
    pinned: false 
  }
] as const as Task[];


export const MOCK_TASK: Task = MOCK_TASKS[0];

describe('Mock Data', () => {
    it('should be valid', () => {
        expect(MOCK_USER).toBeDefined();
        expect(MOCK_TASKS.length).toBeGreaterThan(0);
    });
});
