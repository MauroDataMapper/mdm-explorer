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
import { MatDialog } from '@angular/material/dialog';
import { createMatDialogStub } from '../testing/stubs/mat-dialog.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { AppErrorHandlerService } from './app-error-handler.service';

describe('AppErrorHandlerService', () => {
  let service: AppErrorHandlerService;
  const dialogStub = createMatDialogStub();

  beforeEach(() => {
    service = setupTestModuleForService(AppErrorHandlerService, {
      providers: [
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
