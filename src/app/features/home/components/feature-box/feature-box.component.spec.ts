import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureBoxComponent } from './feature-box.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { UserStore } from '../../../../core/state/user.store';
import { signal, NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureBoxComponent', () => {
  let component: FeatureBoxComponent;
  let fixture: ComponentFixture<FeatureBoxComponent>;
  let mockUserStore: any;

  beforeEach(async () => {
    mockUserStore = {
      isAuthenticated: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [FeatureBoxComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureBoxComponent);
    component = fixture.componentInstance;
    
    // Set default currentLang if needed
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
  });

  const setup = (featureValue: string, itemsCount: number) => {
    // @ts-ignore
    component.feature = signal(featureValue);
    // @ts-ignore
    component.items = signal(itemsCount);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('should create', () => {
    setup('discussion', 3);
    expect(component).toBeTruthy();
  });

  it('should render correct heading for discussion', () => {
    const compiled = setup('discussion', 3);
    const heading = compiled.querySelector('.feature_heading');
    expect(heading?.classList.contains('discussion')).toBeTruthy();
  });

  it('should render correct number of items', () => {
    const compiled = setup('ideation', 5);
    const items = compiled.querySelectorAll('.feature_description_item');
    expect(items.length).toBe(5);
  });

  it('should navigate to login when clicking button and not authenticated', () => {
    setup('voting', 2);
    
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(false);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/account/login'], expect.any(Object));
  });

  it('should navigate to create topic when authenticated', () => {
    setup('discussion', 2);
    
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(true);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en', 'topics', 'create']);
  });
});
