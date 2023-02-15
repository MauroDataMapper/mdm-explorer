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
import { SimpleChange } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent, MockDirective } from 'ng-mocks';
import {
  CatalogueUser,
  CatalogueUserPayload,
} from 'src/app/mauro/catalogue-user.service';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { CatalogueUserBasicFormComponent } from './catalogue-user-basic-form.component';

describe('CatalogueUserBasicFormComponent', () => {
  let harness: ComponentHarness<CatalogueUserBasicFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueUserBasicFormComponent, {
      declarations: [MockComponent(MatFormField), MockDirective(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.formGroup).toBeDefined();
    expect(harness.component.firstName?.value).toBe('');
    expect(harness.component.lastName?.value).toBe('');
    expect(harness.component.organisation?.value).toBe('');
    expect(harness.component.role?.value).toBe('');
  });

  it('should set form fields when user is changed', () => {
    const user: CatalogueUser = {
      id: '123',
      emailAddress: 'test@test.com',
      firstName: 'test',
      lastName: 'user',
      organisation: 'test org',
      jobTitle: 'tester',
    };

    harness.component.user = user;
    harness.component.ngOnChanges({
      user: new SimpleChange(null, user, false),
    });

    expect(harness.component.firstName?.value).toBe(user.firstName);
    expect(harness.component.lastName?.value).toBe(user.lastName);
    expect(harness.component.organisation?.value).toBe(user.organisation);
    expect(harness.component.role?.value).toBe(user.jobTitle);
  });

  it('should emit a cancel event', () => {
    const spy = jest.spyOn(harness.component.cancelClicked, 'emit');
    harness.component.cancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit update if form is invalid', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');
    // Using default values of form means there are required fields missing
    harness.component.update();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit update event with payload', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');

    const payload: CatalogueUserPayload = {
      firstName: 'test',
      lastName: 'user',
      organisation: 'test org',
      jobTitle: 'tester',
    };

    harness.component.firstName?.setValue(payload.firstName);
    harness.component.lastName?.setValue(payload.lastName);
    harness.component.organisation?.setValue(payload.organisation);
    harness.component.role?.setValue(payload.jobTitle);

    harness.component.update();
    expect(spy).toHaveBeenCalledWith(payload);
  });
});
