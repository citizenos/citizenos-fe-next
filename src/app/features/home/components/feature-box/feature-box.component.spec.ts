import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureBoxComponent } from './feature-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FeatureBoxComponent', () => {
  let component: FeatureBoxComponent;
  let fixture: ComponentFixture<FeatureBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureBoxComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureBoxComponent);
    component = fixture.componentInstance;
    // Set required inputs
    fixture.componentRef.setInput('feature', 'ideation');
    fixture.componentRef.setInput('items', 4);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
