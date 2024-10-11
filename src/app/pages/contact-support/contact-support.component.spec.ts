/*
Copyright 2022-2023 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent, MockDirective } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { ContactFormComponent } from 'src/app/data-explorer/contact-form/contact-form.component';
import {
  FeedbackDialogComponent,
  FeedbackDialogResponse,
} from 'src/app/data-explorer/feedback-dialog/feedback-dialog.component';
import { PluginResearchContactPayload } from 'src/app/mauro/plugins/plugin-research.resource';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { createResearchPluginServiceStub } from 'src/app/testing/stubs/research-plugin.stub';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { ContactSupportComponent } from './contact-support.component';

describe('ContactSupportComponent', () => {
  let harness: ComponentHarness<ContactSupportComponent>;
  const researchStub = createResearchPluginServiceStub();
  const dialogStub = createMatDialogStub<FeedbackDialogComponent, FeedbackDialogResponse>();

  const contactData: PluginResearchContactPayload = {
    firstName: 'test',
    lastName: 'person',
    organisation: 'test org',
    emailAddress: 'test@test.com',
    subject: 'testing',
    message: 'this is a test message',
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ContactSupportComponent, {
      declarations: [ContactFormComponent, MockComponent(MatFormField), MockDirective(MatLabel)],
      providers: [
        {
          provide: ResearchPluginService,
          useValue: researchStub,
        },
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
      ],
    });
  });

  beforeEach(() => {
    researchStub.contact.mockClear();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.state).toBe('idle');
    expect(harness.component.contactData).toBeUndefined();
  });

  it('should reset the page', () => {
    harness.component.state = 'sent';

    harness.component.reset();
    expect(harness.component.state).toBe('idle');
    expect(harness.component.contactData).toStrictEqual({ subject: '', message: '' });
  });

  it('should display a success CTA if submitting a contact form', () => {
    researchStub.contact.mockImplementationOnce((data) => {
      expect(data).toBe(contactData);
      return of(data);
    });

    harness.component.contact(contactData);
    expect(harness.component.state).toBe('sent');
  });

  it('should display an error CTA submitting a contact form fails', () => {
    researchStub.contact.mockImplementationOnce((data) => {
      expect(data).toBe(contactData);
      return throwError(() => new Error());
    });

    harness.component.contact(contactData);
    expect(harness.component.state).toBe('error-sending');
  });

  it('should display a success CTA if submitting feedback', fakeAsync(() => {
    const feedback: FeedbackDialogResponse = {
      message: 'test feedback',
    };

    dialogStub.usage.afterClosed.mockImplementationOnce(() => {
      return of(feedback);
    });

    researchStub.contact.mockImplementationOnce((data) => {
      expect(data).toStrictEqual({
        subject: 'Secure Data Environment User Portal feedback',
        message: feedback.message,
      });
      return of(data);
    });

    expect(harness.component.state).toBe('idle');
    harness.component.sendFeedback();
    tick();

    expect(harness.component.state).toBe('sent');
  }));

  it('should display an error CTA if submitting feedback fails', fakeAsync(() => {
    const feedback: FeedbackDialogResponse = {
      message: 'test feedback',
    };

    dialogStub.usage.afterClosed.mockImplementationOnce(() => {
      return of(feedback);
    });

    researchStub.contact.mockImplementationOnce((data) => {
      expect(data).toStrictEqual({
        subject: 'Secure Data Environment User Portal feedback',
        message: feedback.message,
      });
      return throwError(() => new Error());
    });

    expect(harness.component.state).toBe('idle');
    harness.component.sendFeedback();
    tick();

    expect(harness.component.state).toBe('error-sending');
  }));

  it('should not send feedback if the feedback dialog was closed', fakeAsync(() => {
    dialogStub.usage.afterClosed.mockImplementationOnce(() => {
      return of(undefined);
    });

    expect(harness.component.state).toBe('idle');
    harness.component.sendFeedback();
    tick();

    expect(harness.component.state).toBe('idle');
    expect(researchStub.contact).not.toHaveBeenCalled();
  }));
});
