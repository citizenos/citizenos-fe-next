import { FormsModule } from '@angular/forms';
import { InputComponent } from '../input/input.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { ComponentRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { IconRegistryService } from '../icon/icon.registry';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;
  let _componentRef: ComponentRef<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, MockIconComponent, FormsModule],
      providers: [IconRegistryService]
    })
    .overrideComponent(SearchInputComponent, {
      set: { imports: [InputComponent, MockIconComponent, FormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    _componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update value on input change', () => {
    const inputElement = fixture.nativeElement.querySelector('input');
    inputElement.value = 'test text';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.value()).toBe('test text');
  });

  /* it('should update placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'New Placeholder');
    fixture.detectChanges();
    expect(component.placeholder()).toBe('New Placeholder');
  }); */

  it('should show clear button when there is a value', () => {
    component.value.set('test');
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-button');
    expect(clearBtn).toBeTruthy();
  });

  it('should not show clear button when there is no value', () => {
    component.value.set('');
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-button');
    expect(clearBtn).toBeFalsy();
  });

  it('should clear value when clear button is clicked', () => {
    component.value.set('test');
    fixture.detectChanges();
    const clearBtn = fixture.nativeElement.querySelector('.clear-button');
    clearBtn.click();
    fixture.detectChanges();
    expect(component.value()).toBe('');
  });
});
