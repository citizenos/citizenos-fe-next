import { Router, ActivatedRoute } from "@angular/router";
import { UploadService } from "../../../../../core/services/upload.service";
import { UserStore } from "../../../../../core/state/user.store";
import { AuthDialogService } from '../../../../../core/services/auth-dialog.service';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal } from '@angular/core';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { AddIdeaComponent } from './add-idea.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog';
import { AnonymousDialogComponent } from '../anonymous-dialog/anonymous-dialog.component';
import { CloseWithoutSavingDialogComponent } from '../close-without-saving-dialog/close-without-saving-dialog.component';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';

const mockTopic = { id: 't1', status: 'ideation', country: 'ee' } as Topic;
const mockIdeation = {
  id: 'i1',
  template: 'Template description',
  allowAnonymous: false,
  demographicsConfig: null
} as Ideation;

const mockCreatedIdea = { id: 'new-idea', status: IdeaStatus.published } as Idea;
const mockIdeationService = {
  createIdea: vi.fn().mockReturnValue(of(mockCreatedIdea)),
  updateIdea: vi.fn().mockReturnValue(of(mockCreatedIdea)),
  deleteIdea: vi.fn().mockReturnValue(of({})),
};
const mockNotification = {
  addError: vi.fn(),
  success: vi.fn(),
  show: vi.fn(),
  error: vi.fn(),
};
const mockAuthDialog = {
  openLogin: vi.fn().mockReturnValue({
    afterClosed: () => of(true),
    close: vi.fn(),
  }),
};
const mockDialogService = {
  open: vi.fn().mockReturnValue({
    afterClosed: () => of(true),
    close: vi.fn(),
  }),
};
const mockRouter = {
  navigate: vi.fn(),
  url: '/topics/t1',
};

describe('AddIdeaComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIdeationService.createIdea.mockReturnValue(of(mockCreatedIdea));
    mockIdeationService.updateIdea.mockReturnValue(of(mockCreatedIdea));
    mockDialogService.open.mockReturnValue({
      afterClosed: () => of(true),
      close: vi.fn(),
    });
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UploadService, useValue: { upload: vi.fn() } },
        { provide: UserStore, useValue: { user: vi.fn(), isAuthenticated: vi.fn().mockReturnValue(false) } },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: {} },
        { provide: AuthDialogService, useValue: mockAuthDialog },
        { provide: DialogService, useValue: mockDialogService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(ideationOverride?: Partial<Ideation>, topicOverride?: Partial<Topic>) {
    return runInInjectionContext(injector, () => {
      const comp = new AddIdeaComponent();
      (comp as unknown as { topic: unknown }).topic = signal({ ...mockTopic, ...topicOverride });
      (comp as unknown as { ideation: unknown }).ideation = signal({ ...mockIdeation, ...ideationOverride });
      comp.ngOnInit();
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('statement and description start empty', () => {
    const comp = makeComp();
    expect(comp.ideaForm.get('statement')?.value).toBe('');
    expect(comp.ideaForm.get('description')?.value).toBe('');
  });

  describe('Form Initialization on isOpen changes', () => {
    it('initializes description to ideation template when isOpen changes to true', () => {
      const comp = makeComp({ template: 'Custom idea template' });
      expect(comp.description()).toBe('');
      
      comp.isOpen.set(true);
      TestBed.flushEffects();

      expect(comp.description()).toBe('Custom idea template');
      expect(comp.ideaForm.get('description')?.value).toBe('Custom idea template');
    });

    it('openAddIdea opens login dialog when unauthenticated and opens form on login', () => {
      const comp = makeComp({ template: 'Login template' });
      comp.openAddIdea();
      expect(mockAuthDialog.openLogin).toHaveBeenCalledWith('/topics/t1');
      expect(comp.isOpen()).toBe(true);
      expect(comp.description()).toBe('Login template');
    });

    it('openAddIdea opens form directly when authenticated', () => {
      const userStore = TestBed.inject(UserStore);
      (userStore.isAuthenticated as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const comp = makeComp({ template: 'Auth template' });
      comp.openAddIdea();
      expect(mockAuthDialog.openLogin).not.toHaveBeenCalled();
      expect(comp.isOpen()).toBe(true);
      expect(comp.description()).toBe('Auth template');
    });
  });

  describe('Demographics Validation and Error Messages', () => {
    it('does not require demographics fields if allowAnonymous is false', () => {
      const comp = makeComp({
        allowAnonymous: false,
        demographicsConfig: {
          residence: { required: true, value: '' },
          gender: { required: true, value: '' },
          age: { required: true, value: '' },
        } as never,
      });

      comp.ideaForm.patchValue({
        statement: 'Valid statement',
        description: 'Valid description',
      });

      const isValid = comp.validateRequiredFieldsForPublish();
      expect(isValid).toBe(true);
      expect(comp.filtersData()['residence'].error).toBe(false);
      expect(comp.filtersData()['gender'].error).toBe(false);
    });

    it('validates required demographics when allowAnonymous is true', () => {
      const comp = makeComp({
        allowAnonymous: true,
        demographicsConfig: {
          residence: { required: true, value: '' },
          gender: { required: true, value: '' },
          age: { required: true, value: '' },
        } as never,
      });

      comp.ideaForm.patchValue({
        statement: 'Valid statement',
        description: 'Valid description',
      });

      const isValid = comp.validateRequiredFieldsForPublish();
      expect(isValid).toBe(false);
      expect(comp.filtersData()['residence'].error).toBe(true);
      expect(comp.filtersData()['gender'].error).toBe(true);
      expect(comp.ideaForm.get('demographics_age')?.invalid).toBe(true);
    });

    it('clears error when setDemographicsValue or setFilterValue is called', () => {
      const comp = makeComp({
        allowAnonymous: true,
        demographicsConfig: {
          residence: { required: true, value: '' },
          gender: { required: true, value: '' },
        } as never,
      });

      comp.validateRequiredFieldsForPublish();
      expect(comp.filtersData()['residence'].error).toBe(true);
      expect(comp.filtersData()['gender'].error).toBe(true);

      comp.setDemographicsValue('residence', 'Tallinn');
      expect(comp.filtersData()['residence'].error).toBe(false);
      expect(comp.filtersData()['residence'].selectedValue).toBe('Tallinn');
      expect(comp.ideaForm.get('demographics_residence')?.value).toBe('Tallinn');

      comp.setFilterValue('gender', 'female');
      expect(comp.filtersData()['gender'].error).toBe(false);
      expect(comp.filtersData()['gender'].selectedValue).toBe('female');
      expect(comp.ideaForm.get('demographics_gender')?.value).toBe('female');
    });
  });

  describe('Confirmation Dialogs', () => {
    it('opens AnonymousDialogComponent when allowAnonymous is true and saves on confirmation', () => {
      const comp = makeComp({ allowAnonymous: true });
      comp.ideaForm.patchValue({
        statement: 'Anonymous statement',
        description: 'Anonymous description',
      });

      mockDialogService.open.mockReturnValue({
        afterClosed: () => of(true),
        close: vi.fn(),
      });

      comp.publishIdea();

      expect(mockDialogService.open).toHaveBeenCalledWith(AnonymousDialogComponent);
      expect(mockIdeationService.createIdea).toHaveBeenCalledWith(expect.objectContaining({
        statement: 'Anonymous statement',
        description: 'Anonymous description',
        status: IdeaStatus.published,
      }));
    });

    it('does not save when user cancels AnonymousDialogComponent', () => {
      const comp = makeComp({ allowAnonymous: true });
      comp.ideaForm.patchValue({
        statement: 'Anonymous statement',
        description: 'Anonymous description',
      });

      mockDialogService.open.mockReturnValue({
        afterClosed: () => of(false),
        close: vi.fn(),
      });

      comp.publishIdea();

      expect(mockDialogService.open).toHaveBeenCalledWith(AnonymousDialogComponent);
      expect(mockIdeationService.createIdea).not.toHaveBeenCalled();
    });

    it('saves directly without opening AnonymousDialogComponent when allowAnonymous is false', () => {
      const comp = makeComp({ allowAnonymous: false });
      comp.ideaForm.patchValue({
        statement: 'Normal statement',
        description: 'Normal description',
      });

      comp.publishIdea();

      expect(mockDialogService.open).not.toHaveBeenCalledWith(AnonymousDialogComponent);
      expect(mockIdeationService.createIdea).toHaveBeenCalled();
    });

    it('close() closes immediately without dialog when form has no changes', () => {
      const comp = makeComp({ template: 'Default template' });
      comp.isOpen.set(true);
      comp.description.set('Default template');
      comp.ideaForm.patchValue({ statement: '', description: 'Default template' });

      comp.close();

      expect(mockDialogService.open).not.toHaveBeenCalledWith(CloseWithoutSavingDialogComponent);
      expect(comp.isOpen()).toBe(false);
    });

    it('close() opens CloseWithoutSavingDialogComponent when statement has changes', () => {
      const comp = makeComp();
      comp.isOpen.set(true);
      comp.ideaForm.patchValue({ statement: 'Draft text' });

      mockDialogService.open.mockReturnValue({
        afterClosed: () => of(undefined), // User confirms Close
        close: vi.fn(),
      });

      comp.close();

      expect(mockDialogService.open).toHaveBeenCalledWith(CloseWithoutSavingDialogComponent);
      expect(comp.isOpen()).toBe(false);
      expect(comp.ideaForm.get('statement')?.value).toBe('');
    });

    it('close() keeps form open when user cancels CloseWithoutSavingDialogComponent', () => {
      const comp = makeComp();
      comp.isOpen.set(true);
      comp.ideaForm.patchValue({ statement: 'Draft text' });

      mockDialogService.open.mockReturnValue({
        afterClosed: () => of(true), // User clicks Back / Keep editing
        close: vi.fn(),
      });

      comp.close();

      expect(mockDialogService.open).toHaveBeenCalledWith(CloseWithoutSavingDialogComponent);
      expect(comp.isOpen()).toBe(true);
      expect(comp.ideaForm.get('statement')?.value).toBe('Draft text');
    });
  });

  describe('Saving, Form Closing, Notifications and Error Handling', () => {
    it('afterPost resets form, closes immediately, emits ideaAdded, and shows success notification', () => {
      const comp = makeComp();
      comp.isOpen.set(true);
      const emitSpy = vi.spyOn(comp.ideaAdded, 'emit');

      comp.afterPost(mockCreatedIdea);

      expect(comp.isOpen()).toBe(false);
      expect(comp.ideaForm.get('statement')?.value).toBe('');
      expect(emitSpy).toHaveBeenCalledWith(mockCreatedIdea);
      expect(mockNotification.show).toHaveBeenCalledWith('success', 'COMPONENTS.ADD_IDEA.MSG_SUCCESS');
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/', 'en', 'topics', 't1'],
        expect.objectContaining({ queryParams: { ideaId: 'new-idea' } })
      );
    });

    it('saveIdea displays error notification and resets isSubmitting on API error', () => {
      const comp = makeComp();
      mockIdeationService.createIdea.mockReturnValue(throwError(() => ({
        error: { status: { message: 'Failed to create idea' } },
      })));

      comp.ideaForm.patchValue({
        statement: 'Error statement',
        description: 'Error description',
      });

      comp.publishIdea();

      expect(mockNotification.error).toHaveBeenCalledWith('Failed to create idea');
      expect(comp.isSubmitting()).toBe(false);
      expect(comp.errors()).toBeTruthy();
    });
  });
});
