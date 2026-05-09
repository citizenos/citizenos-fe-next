import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureBoxComponent } from './feature-box.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserStore } from '../../../../core/state/user.store';
import { signal, NO_ERRORS_SCHEMA, ComponentRef } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('FeatureBoxComponent', () => {
  let component: FeatureBoxComponent;
  let fixture: ComponentFixture<FeatureBoxComponent>;
  let componentRef: ComponentRef<FeatureBoxComponent>;
  let mockUserStore: unknown;

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
    componentRef = fixture.componentRef;

    const translate = TestBed.inject(TranslateService);
    translate.use('en');
  });

  const setup = async (featureValue: string, itemsCount: number) => {
    componentRef.setInput('feature', featureValue);
    componentRef.setInput('items', itemsCount);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render correct heading for all feature types', async () => {
    const features = ['discussion', 'ideation', 'voting'];
    for (const f of features) {
      const compiled = await setup(f, 1);
      const heading = compiled.querySelector('.feature_heading');
      expect(heading?.classList.contains(f)).toBeTruthy();
      expect(heading?.textContent?.toLowerCase()).toContain(f);
    }
  });

  it('should render correct number of items', async () => {
    await setup('ideation', 5);
    expect(component.items()).toBe(5);
    expect(component.itemsList().length).toBe(5);
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.feature_description_item');
    expect(items.length).toBe(5);
  });

  it('should navigate to login when clicking button and not authenticated', async () => {
    await setup('voting', 2);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(false);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/account/login'], expect.any(Object));
  });

  it('should navigate to create topic when authenticated', async () => {
    await setup('discussion', 2);

    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(true);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en', 'topics', 'create']);
  });
});
