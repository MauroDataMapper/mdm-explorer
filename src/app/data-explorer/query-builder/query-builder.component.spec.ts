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
import { QueryBuilderComponent } from './query-builder.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { MatDialog } from '@angular/material/dialog';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';

describe('QueryBuilderComponent', () => {
  let harness: ComponentHarness<QueryBuilderComponent>;
  const matDialogStub = createMatDialogStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(QueryBuilderComponent, {
      providers: [
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
