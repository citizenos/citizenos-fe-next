import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepInfoComponent } from './step-info.component';

const baseGroup = {
  name: '',
  description: '',
  visibility: 'private' as const,
  members: { users: [], topics: { rows: [], count: 0 } },
  rules: [] as string[],
};

describe('StepInfoComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(group = baseGroup): StepInfoComponent {
    const comp = runInInjectionContext(injector, () => new StepInfoComponent());
    (comp as unknown as { _group: () => unknown })._group = () => group;
    Object.defineProperty(comp, 'group', { value: () => group });
    return comp;
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('ngOnInit sets 3 empty rules when group has no rules', () => {
    const comp = makeComp();
    comp.ngOnInit();
    expect(comp.rules().length).toBe(3);
  });

  it('ngOnInit loads existing rules from group', () => {
    const comp = makeComp({ ...baseGroup, rules: ['Be kind', 'Be honest'] });
    comp.ngOnInit();
    expect(comp.rules().length).toBe(2);
    expect(comp.rules()[0].rule).toBe('Be kind');
  });

  it('addRule adds an empty rule', () => {
    const comp = makeComp();
    comp.ngOnInit();
    const before = comp.rules().length;
    comp.addRule();
    expect(comp.rules().length).toBe(before + 1);
  });

  it('removeRule removes at index', () => {
    const comp = makeComp();
    comp.ngOnInit();
    comp.removeRule(0);
    expect(comp.rules().length).toBe(2);
  });

  it('onRuleChange updates rule value', () => {
    const comp = makeComp();
    comp.ngOnInit();
    comp.onRuleChange(0, 'New rule');
    expect(comp.rules()[0].rule).toBe('New rule');
  });

  it('onNameChange emits groupUpdate', () => {
    const comp = makeComp();
    const spy = vi.fn();
    comp.groupUpdate.subscribe(spy);
    comp.onNameChange('Test Name');
    expect(spy).toHaveBeenCalledWith({ name: 'Test Name' });
  });

  it('updateContact emits groupUpdate', () => {
    const comp = makeComp();
    const spy = vi.fn();
    comp.groupUpdate.subscribe(spy);
    comp.updateContact('test@example.com');
    expect(spy).toHaveBeenCalledWith({ contact: 'test@example.com' });
  });
});
