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
import { UserRegistrationComponent } from './user-registration.component';
import { DisplayValuePair } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';

describe('UserRegistrationComponent', () => {
  let harness: ComponentHarness<UserRegistrationComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(UserRegistrationComponent, {
      declarations: [],
      providers: [],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('should populate organisationOptions on init', () => {
      const expectedOptions: DisplayValuePair[] = [
        { displayValue: 'Org 1', value: 'org1' },
        { displayValue: 'Org 2', value: 'org2' },
        { displayValue: 'Org 3', value: 'org3' },
      ];

      jest
        .spyOn(harness.component, 'mockGetOrganisationOptions')
        .mockReturnValue(of(expectedOptions));
      harness.component.ngOnInit();

      expect(harness.component.organisationOptions).toEqual(expectedOptions);
    });
  });
});
