/*
Copyright 2022 University of Oxford
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
import { SimpleChange } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { PluginResearchContactPayload } from 'src/app/mdm-rest-client/plugins/plugin-research.resource';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { ContactFormComponent, ContactFormState } from './contact-form.component';

describe('ContactFormComponent', () => {
  let harness: ComponentHarness<ContactFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ContactFormComponent, {
      declarations: [MockComponent(MatFormField), MockComponent(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.formFieldAppearance).toBe('outline');
    expect(harness.component.data).toBeUndefined();
    expect(harness.component.state).toBe('idle');
    expect(harness.component.contactForm).toBeUndefined();
  });

  it('should be initialised', () => {
    harness.component.ngOnInit();
    expect(harness.component.contactForm).toBeDefined();
    expect(harness.component.firstName?.value).toBe('');
    expect(harness.component.lastName?.value).toBe('');
    expect(harness.component.organisation?.value).toBe('');
    expect(harness.component.email?.value).toBe('');
    expect(harness.component.subject?.value).toBe('');
    expect(harness.component.message?.value).toBe('');
  });

  it('should disable the form is state is changed to "sending"', () => {
    harness.component.ngOnInit();

    const spy = jest.spyOn(harness.component.contactForm, 'disable');
    const state: ContactFormState = 'sending';

    harness.component.state = state;
    harness.component.ngOnChanges({ state: new SimpleChange(null, state, false) });

    expect(spy).toHaveBeenCalled();
  });

  it('should enable the form is state is changed to not "sending"', () => {
    harness.component.ngOnInit();

    const spy = jest.spyOn(harness.component.contactForm, 'enable');
    const state: ContactFormState = 'idle';

    harness.component.state = state;
    harness.component.ngOnChanges({ state: new SimpleChange(null, state, false) });

    expect(spy).toHaveBeenCalled();
  });

  it('should preset the form fields to the given data', () => {
    harness.component.ngOnInit();

    const data: PluginResearchContactPayload = {
      firstName: 'test',
      lastName: 'person',
      organisation: 'test org',
      emailAddress: 'test@test.com',
      subject: 'testing',
      message: 'this is a test message',
    };

    harness.component.data = data;
    harness.component.ngOnChanges({ data: new SimpleChange(null, data, false) });

    expect(harness.component.firstName?.value).toBe(data.firstName);
    expect(harness.component.lastName?.value).toBe(data.lastName);
    expect(harness.component.organisation?.value).toBe(data.organisation);
    expect(harness.component.email?.value).toBe(data.emailAddress);
    expect(harness.component.subject?.value).toBe(data.subject);
    expect(harness.component.message?.value).toBe(data.message);
  });

  it('should not raise a submit event with invalid form input', () => {
    const spy = jest.spyOn(harness.component.submitClicked, 'emit');
    harness.component.ngOnInit();
    harness.component.submit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should raise a submit event with valid form input', () => {
    const spy = jest.spyOn(harness.component.submitClicked, 'emit');

    const data: PluginResearchContactPayload = {
      firstName: 'test',
      lastName: 'person',
      organisation: 'test org',
      emailAddress: 'test@test.com',
      subject: 'testing',
      message: 'this is a test message',
    };

    harness.component.ngOnInit();
    harness.component.firstName?.setValue(data.firstName);
    harness.component.lastName?.setValue(data.lastName);
    harness.component.organisation?.setValue(data.organisation);
    harness.component.email?.setValue(data.emailAddress);
    harness.component.subject?.setValue(data.subject);
    harness.component.message?.setValue(data.message);

    harness.component.submit();

    expect(spy).toHaveBeenCalledWith(data);
  });
});
