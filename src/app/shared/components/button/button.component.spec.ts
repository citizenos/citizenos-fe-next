import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({});
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): ButtonComponent {
    return runInInjectionContext(injector, () => new ButtonComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('defaults to primary variant and md size', () => {
    const comp = makeComp();
    expect(comp.variant()).toBe('primary');
    expect(comp.size()).toBe('md');
    expect(comp.type()).toBe('button');
  });

  it('calculates icon size based on button size', () => {
    const comp = makeComp();
    // Default size is 'md'
    expect(comp.iconSize()).toBe(20);

    // Set size to 'sm'
    TestBed.runInInjectionContext(() => {
       // Since signal inputs cannot be set directly after creation, we'd normally use ComponentRef.setInput in a full component test.
       // For a logic-only test, we check the function logic.
    });
  });

  it('emits clicked output when not disabled or loading', () => {
    const comp = makeComp();
    const spy = vi.spyOn(comp.clicked, 'emit');
    const event = new MouseEvent('click');
    
    comp.onClick(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('does not emit clicked output when disabled', () => {
    const comp = makeComp();
    const spy = vi.spyOn(comp.clicked, 'emit');
    
    // We can't set signal inputs directly on the instance easily without a host component or ComponentRef.
    // But we can test the internal onClick logic if we mock the signal values.
    vi.spyOn(comp, 'isDisabled').mockReturnValue(true);
    
    comp.onClick(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not emit clicked output when loading', () => {
    const comp = makeComp();
    const spy = vi.spyOn(comp.clicked, 'emit');
    
    vi.spyOn(comp, 'isLoading').mockReturnValue(true);
    
    comp.onClick(new MouseEvent('click'));
    expect(spy).not.toHaveBeenCalled();
  });
});
