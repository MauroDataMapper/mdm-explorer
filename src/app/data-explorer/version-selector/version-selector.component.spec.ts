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
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { VersionOption, VersionSelectorComponent } from './version-selector.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { SimpleModelVersionTree } from '@maurodatamapper/mdm-resources';
import { of } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

describe('VersionSelectorComponent', () => {
  let harness: ComponentHarness<VersionSelectorComponent>;
  const dataModelsStub = createDataModelServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(VersionSelectorComponent, {
      declarations: [],
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('functional tests', () => {
    beforeEach(() => {
      dataModelsStub.simpleModelVersionTree.mockClear();
    });

    const testId1 = '12123-58784-asdasd1544';
    const testId2 = 'e967d243-0e40-42c7-ad80-c366c732b390';
    const defaultOption: VersionOption = { id: testId1, displayName: 'V1.0.0' };
    const simpleModelTree: SimpleModelVersionTree[] = [
      {
        id: testId2,
        branch: undefined,
        modelVersion: '1.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V1.0.0',
      },
      {
        id: testId1,
        branch: 'main',
        modelVersion: undefined,
        documentationVersion: '1.0.0',
        displayName: 'main (V1.0.0)',
      },
    ];

    const expectedVersionOptionsFromModelTree: VersionOption[] = [
      {
        id: testId2,
        displayName: 'V1.0.0',
      },
      {
        id: testId1,
        displayName: 'V2.0.0',
      },
    ];

    it('Should use the default version when there is no tree', () => {
      dataModelsStub.simpleModelVersionTree.mockImplementation(() => {
        return of([]);
      });
      harness.component.modelId = testId1;
      harness.component.ngOnInit();

      expect(harness.component.modelId).toBe(testId1);
      expect(harness.component.currentVersion).toStrictEqual(defaultOption);
      expect(harness.component.versionOptions).toStrictEqual([defaultOption]);
    });

    it('should raise the version select event', () => {
      const spy = jest.spyOn(harness.component.valueChange, 'emit');
      const event = {
        value: {
          id: 'id',
          displayName: 'displayName',
        },
      } as MatSelectChange;
      harness.component.select(event);
      expect(spy).toHaveBeenCalledWith(event.value);
    });

    it('Should setup the correct version for the starting modelId', () => {
      dataModelsStub.simpleModelVersionTree.mockImplementation(() => {
        return of(simpleModelTree);
      });
      harness.component.modelId = testId1;
      harness.component.ngOnInit();

      expect(harness.component.modelId).toBe(testId1);
      expect(harness.component.currentVersion).toStrictEqual({
        id: testId1,
        displayName: 'V2.0.0',
      });
      expect(harness.component.versionOptions).toStrictEqual(
        expectedVersionOptionsFromModelTree,
      );
    });
  });
});
