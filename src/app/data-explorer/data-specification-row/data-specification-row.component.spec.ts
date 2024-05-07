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
import { ComponentHarness, setupTestModuleForComponent } from '../../testing/testing.helpers';

import { DataSpecificationRowComponent } from './data-specification-row.component';
import { DataSpecification } from '../data-explorer.types';

describe('DataSpecificationRowComponent', () => {
  let harness: ComponentHarness<DataSpecificationRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataSpecificationRowComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataSpecification).toBeUndefined();
    expect(harness.component.detailsRouterLink).toBeUndefined();
    expect(harness.component.showStatus).toBe(true);
    expect(harness.component.showLabel).toBe(true);
    expect(harness.component.showFinaliseButton).toBe(false);
    expect(harness.component.showCopyButton).toBe(false);
  });

  it('should raise the finalise click event', () => {
    const spy = jest.spyOn(harness.component.finaliseClick, 'emit');
    harness.component.onFinaliseClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should raise the submit click event', () => {
    const spy = jest.spyOn(harness.component.submitClick, 'emit');
    harness.component.onSubmitClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should raise the copy click event', () => {
    const spy = jest.spyOn(harness.component.copyClick, 'emit');
    harness.component.onCopyClick();
    expect(spy).toHaveBeenCalled();
  });

  it.each`
    dataSpecStatus | currentUserOwnsDataSpec | showFinaliseButton | showShareButton
    ${'finalised'} | ${true}                 | ${false}           | ${true}
    ${'finalised'} | ${false}                | ${false}           | ${false}
    ${'unsent'}    | ${true}                 | ${true}            | ${false}
    ${'unsent'}    | ${false}                | ${false}           | ${false}
  `(
    'should set properties correctly when isFinalised=$isFinalised and currentUserOwnsDataSpec=$currentUserOwnsDataSpec',
    ({ dataSpecStatus, currentUserOwnsDataSpec, showFinaliseButton, showShareButton }) => {
      // Set input values
      harness.component.dataSpecification = {
        status: dataSpecStatus,
      } as DataSpecification;
      harness.component.currentUserOwnsDataSpec = currentUserOwnsDataSpec;

      harness.component.ngOnChanges();

      // Assert component properties are set correctly
      expect(harness.component.showFinaliseButton).toBe(showFinaliseButton);
      expect(harness.component.showShareButton).toBe(showShareButton);
    }
  );
});
