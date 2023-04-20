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

import { ShareDataSpecificationDialogComponent } from './share-data-specification-dialog.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ShareDataSpecificationDialogComponent', () => {
  let harness: ComponentHarness<ShareDataSpecificationDialogComponent>;
  const dialogRefStub = createMatDialogRefStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ShareDataSpecificationDialogComponent, {
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: [],
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
