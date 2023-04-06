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
import { SimpleChange, SimpleChanges } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { PublicOpenIdConnectProvider } from '@maurodatamapper/mdm-resources';
import { MockComponent, MockDirective } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { SignInClickEvent, SignInFormComponent } from './sign-in-form.component';

describe('SignInFormComponent', () => {
  let harness: ComponentHarness<SignInFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SignInFormComponent, {
      declarations: [MockComponent(MatFormField), MockDirective(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.authenticating).toBe(false);
    expect(harness.component.formFieldAppearance).toBe('outline');
    expect(harness.component.signInError).toBeUndefined();
  });

  describe('on changes', () => {
    const triggerChange = (authenticate: boolean) => {
      const changes: SimpleChanges = {
        authenticating: new SimpleChange(authenticate, authenticate, false),
      };

      harness.component.authenticating = authenticate;
      harness.component.ngOnChanges(changes);
    };

    it('should disable the form when authenticating', () => {
      expect(harness.component.signInForm.enabled).toBe(true);

      triggerChange(true);
      expect(harness.component.signInForm.enabled).toBe(false);
    });

    it('should enable the form when not authenticating', () => {
      triggerChange(true);
      expect(harness.component.signInForm.enabled).toBe(false);

      triggerChange(false);
      expect(harness.component.signInForm.enabled).toBe(true);
    });
  });

  it('should raise an event when signing in', () => {
    const expected: SignInClickEvent = {
      userName: 'test@test.com',
      password: '12345',
    };

    harness.component.userName.setValue(expected.userName);
    harness.component.password.setValue(expected.password);

    const eventSpy = jest.spyOn(harness.component.signInClicked, 'emit');

    harness.component.signIn();
    expect(eventSpy).toHaveBeenCalledWith(expected);
  });

  it('should raise an event when using openid connect', () => {
    const expected: PublicOpenIdConnectProvider = {
      id: '123',
      label: 'test provider',
      authorizationEndpoint: 'url',
      standardProvider: true,
    };

    const eventSpy = jest.spyOn(harness.component.openIdConnectClicked, 'emit');
    harness.component.authenticateWithOpenIdConnect(expected);
    expect(eventSpy).toHaveBeenCalledWith(expected);
  });
});
