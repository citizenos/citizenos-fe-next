import { TestBed } from '@angular/core/testing';
import { InitialsComponent } from './initials/initials.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('real component ɵcmp inspection', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InitialsComponent] }).compileComponents();
  });

  it('InitialsComponent ɵcmp.inputs', () => {
    const def = (InitialsComponent as any).ɵcmp;
    console.log('InitialsComponent ɵcmp.inputs:', JSON.stringify(def?.inputs));
    console.log('InitialsComponent ɵcmp.signals:', def?.signals);
    
    const fixture = TestBed.createComponent(InitialsComponent);
    const ref = fixture.componentRef as any;
    console.log('_tNode.inputs:', JSON.stringify(ref._tNode?.inputs));
    
    // Try setInput directly
    fixture.componentRef.setInput('name', 'John Doe');
    console.log('name() after setInput:', fixture.componentInstance.name());
    
    expect(fixture.componentInstance).toBeTruthy();
  });
});
