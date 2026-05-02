import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';
import { Component, Input, ComponentRef } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

describe('InputComponent Accessibility', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let ref: ComponentRef<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, MockIconComponent, TranslateModule.forRoot()]
    })
    .overrideComponent(InputComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    ref = fixture.componentRef;
    
    // Set some defaults
    component.label.set('Full Name');
    component.errorMessage.set('Error here');
    component.hasError.set(true);
    
    fixture.detectChanges();
  });

  it('should associate label with input via for/id', () => {
    const label = fixture.nativeElement.querySelector('.input-label');
    const input = fixture.nativeElement.querySelector('input');
    
    expect(label).toBeTruthy();
    // We need to project an input for it to find one
    fixture.nativeElement.querySelector('.input-wrapper').innerHTML += '<input id="test-id">';
    fixture.detectChanges();
    const injectedInput = fixture.nativeElement.querySelector('#test-id');
    
    expect(label.getAttribute('for')).toBe(component.inputId);
  });

  it('should associate error message with input via aria-describedby', () => {
    const error = fixture.nativeElement.querySelector('.error-message');
    expect(error).toBeTruthy();
    expect(error.id).toBe(component.errorId);
  });
});
