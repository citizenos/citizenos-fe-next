import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BigGraphComponent } from './big-graph.component';
import { signal } from '@angular/core';

const mockRows = [
  { id: '1', value: 'Yes', voteCount: 10, winner: true },
  { id: '2', value: 'No', voteCount: 5, winner: false },
  { id: '3', value: 'Neutral', voteCount: 2, winner: false },
];

describe('BigGraphComponent', () => {
  let component: BigGraphComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    component = TestBed.runInInjectionContext(() => new BigGraphComponent());
    (component as unknown as { options: unknown }).options = signal({ rows: mockRows });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sortedOptions should be ordered by voteCount descending', () => {
    const sorted = component.sortedOptions();
    expect(sorted[0].voteCount).toBe(10);
    expect(sorted[1].voteCount).toBe(5);
    expect(sorted[2].voteCount).toBe(2);
  });

  it('getVoteCountTotal should sum all voteCount values', () => {
    expect(component.getVoteCountTotal()).toBe(17);
  });

  it('getVoteValuePercentage should return correct percentage string', () => {
    expect(component.getVoteValuePercentage(10)).toBe(`${(10 / 17) * 100}%`);
  });

  it('getVoteValuePercentage should return "0" when value is 0', () => {
    expect(component.getVoteValuePercentage(0)).toBe('0');
  });

  it('getVoteValuePercentage should return "0" when rows are empty', () => {
    (component as unknown as { options: unknown }).options = signal({ rows: [] });
    expect(component.getVoteValuePercentage(5)).toBe('0');
  });

  it('sortedOptions should handle options with equal voteCount', () => {
    (component as unknown as { options: unknown }).options = signal({
      rows: [{ id: 'a', voteCount: 3 }, { id: 'b', voteCount: 3 }]
    });
    const sorted = component.sortedOptions();
    expect(sorted.length).toBe(2);
  });
});
