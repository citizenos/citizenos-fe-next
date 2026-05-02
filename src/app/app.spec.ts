import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { MockIconComponent } from './shared/testing/mocks';
import { IconComponent } from './shared/components/icon/icon.component';
import { TranslateModule } from '@ngx-translate/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, TranslateModule.forRoot()],
      providers: [
        provideRouter([])
      ]
    })
    .overrideComponent(App, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});
