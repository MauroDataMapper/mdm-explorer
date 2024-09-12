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
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import {
  CatalogueUser,
  CatalogueUserPayload,
  CatalogueUserService,
  CatalogueUserContactPayload,
} from 'src/app/mauro/catalogue-user.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { createCatalogueUserServiceStub } from 'src/app/testing/stubs/catalogue-user.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { MyAccountComponent } from './my-account.component';
import { createDataSpecificationServiceStub } from 'src/app/testing/stubs/data-specifications.stub';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MatDialog } from '@angular/material/dialog';
import { fakeAsync, tick } from '@angular/core/testing';
import { CatalogueItemDomainType, FolderDetail } from '@maurodatamapper/mdm-resources';
import { createFolderServiceStub } from 'src/app/testing/stubs/folder.stub';
import { FolderService } from 'src/app/mauro/folder.service';

describe('MyAccountComponent', () => {
  let harness: ComponentHarness<MyAccountComponent>;

  const securityStub = createSecurityServiceStub();
  const catalogueUserStub = createCatalogueUserServiceStub();
  const stateRouterStub = createStateRouterStub();
  const toastrStub = createToastrServiceStub();
  const broadcastStub = createBroadcastServiceStub();
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const matDialogStub = createMatDialogStub();
  const folderStub = createFolderServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyAccountComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: CatalogueUserService,
          useValue: catalogueUserStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
        {
          provide: FolderService,
          useValue: folderStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.user).toBeUndefined();
    expect(harness.component.basicInfoMode).toBe('view');
  });

  describe('initialisation', () => {
    const userDetails: UserDetails = {
      id: '123',
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
    };

    it('should return to the home page if no user id was found', () => {
      const spy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');
      securityStub.getSignedInUser.mockReturnValueOnce(null);

      harness.component.ngOnInit();

      expect(spy).toHaveBeenCalledWith('/home');
    });

    it('should fetch the full details of the signed in user', () => {
      const expected: CatalogueUser = {
        id: userDetails.id,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        emailAddress: userDetails.email,
      };

      securityStub.getSignedInUser.mockReturnValueOnce(userDetails);
      catalogueUserStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(userDetails.id);
        return of(expected);
      });

      harness.component.ngOnInit();

      expect(harness.component.user).toBe(expected);
    });

    it('should raise an error if failed to get catalogue user details', () => {
      const spy = jest.spyOn(toastrStub, 'error');

      securityStub.getSignedInUser.mockReturnValueOnce(userDetails);
      catalogueUserStub.get.mockImplementationOnce(() => throwError(() => {}));

      harness.component.ngOnInit();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('changing edit modes', () => {
    it('should set mode to "edit" when triggering basic info edit mode', () => {
      harness.component.editBasicInfo();
      expect(harness.component.basicInfoMode).toBe('edit');
    });

    it('should set mode to "view" when cancelling basic info edit mode', () => {
      harness.component.editBasicInfo();
      expect(harness.component.basicInfoMode).toBe('edit');
      harness.component.cancelEditBasicInfo();
      expect(harness.component.basicInfoMode).toBe('view');
    });
  });

  describe('updating basic info', () => {
    const currentUser: CatalogueUser = {
      id: '123',
      firstName: 'test',
      lastName: 'user',
      emailAddress: 'test@test.com',
    };

    it('should do nothing if no user is set', () => {
      harness.component.updateBasicInfo({} as CatalogueUserPayload);
      expect(catalogueUserStub.update).not.toHaveBeenCalled();
    });

    it('should update the details of a user', () => {
      const payload: CatalogueUserPayload = {
        firstName: 'test2',
        lastName: 'user2',
        organisation: 'test org2',
        jobTitle: 'tester2',
      };

      harness.component.user = currentUser;

      const expectedUser: CatalogueUser = {
        id: currentUser.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        emailAddress: currentUser.emailAddress,
        organisation: payload.organisation,
        jobTitle: payload.jobTitle,
      };

      catalogueUserStub.update.mockImplementationOnce((id, pl) => {
        expect(id).toBe(currentUser.id);
        expect(pl).toBe(payload);
        expect(harness.component.basicInfoMode).toBe('updating');
        return of(expectedUser);
      });

      harness.component.updateBasicInfo(payload);

      expect(harness.component.user).toBe(expectedUser);
      expect(harness.component.basicInfoMode).toBe('view');
      expect(toastrStub.success).toHaveBeenCalled();
    });

    it('should raise an error when updating fails', () => {
      const payload: CatalogueUserPayload = {
        firstName: 'test2',
        lastName: 'user2',
        organisation: 'test org2',
        jobTitle: 'tester2',
      };

      harness.component.user = currentUser;

      catalogueUserStub.update.mockImplementationOnce(() => {
        expect(harness.component.basicInfoMode).toBe('updating');
        return throwError(() => {});
      });

      harness.component.updateBasicInfo(payload);

      expect(harness.component.user).toBe(currentUser);
      expect(harness.component.basicInfoMode).toBe('edit');
      expect(toastrStub.error).toHaveBeenCalled();
    });
  });

  describe('signing out', () => {
    it('should broadcast a sign out event', () => {
      const spy = jest.spyOn(broadcastStub, 'dispatch');
      harness.component.signOut();
      expect(spy).toHaveBeenCalledWith('sign-out-user');
    });
  });

  describe('updating contact info', () => {
    const outdatedUser: CatalogueUser = {
      id: '123',
      firstName: 'test',
      lastName: 'user',
      emailAddress: 'test@test.com',
    };

    beforeEach(() => {
      toastrStub.success.mockClear();
      broadcastStub.dispatch.mockClear();
    });

    it('should do nothing if no user is set', () => {
      // since we genericly use update its called twice in previous tests, we want it to exit before calling a third time with an empty payload.
      harness.component.updateContactInfo({} as CatalogueUserContactPayload);
      expect(catalogueUserStub.update).not.toBeCalledTimes(3);
    });

    it('should update the details of a user and the related folder', fakeAsync(() => {
      const payload: CatalogueUserContactPayload = {
        emailAddress: 'changed@test.com',
      };

      const newFolderName = 'changed[at]test.com';

      const folder: FolderDetail = {
        id: '456',
        label: 'folder',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      harness.component.user = outdatedUser;

      const updatedUser: CatalogueUser = {
        id: '123',
        emailAddress: payload.emailAddress,
      };

      matDialogStub.usage.afterClosed.mockImplementationOnce(() => of({ status: 'ok' }));

      catalogueUserStub.update.mockImplementationOnce((id, pl) => {
        expect(id).toBe(outdatedUser.id);
        expect(pl).toBe(payload);
        expect(harness.component.contactInfoMode).toBe('updating');
        return of(updatedUser);
      });

      dataSpecificationStub.getDataSpecificationFolder.mockImplementationOnce(() => {
        return of(folder);
      });

      dataSpecificationStub.getDataSpecificationFolderName.mockImplementationOnce((email) => {
        expect(email).toBe(updatedUser.emailAddress);
        return newFolderName;
      });

      dataSpecificationStub.updateDataSpecificationsFolder.mockImplementationOnce(
        (folderId, email) => {
          expect(folderId).toBe(folder.id);
          expect(email).toBe(updatedUser.emailAddress);
          return of();
        }
      );

      folderStub.update.mockImplementationOnce((folderId, pl) => {
        expect(folderId).toBe(folder.id);
        expect(pl.label).toBe(newFolderName);
        return of(folder);
      });

      harness.component.updateContactInfo(payload);

      tick();

      expect(toastrStub.success).toHaveBeenCalled();
      expect(broadcastStub.dispatch).toHaveBeenCalledWith('sign-out-user');
    }));

    it('should raise an error when updating fails', fakeAsync(() => {
      const payload: CatalogueUserContactPayload = {
        emailAddress: 'changed@test.com',
      };

      harness.component.user = outdatedUser;

      matDialogStub.usage.afterClosed.mockImplementationOnce(() => of({ status: 'ok' }));

      catalogueUserStub.update.mockImplementationOnce(() => {
        expect(harness.component.contactInfoMode).toBe('updating');
        return throwError(() => {});
      });

      harness.component.updateContactInfo(payload);

      tick();

      expect(harness.component.user).toBe(outdatedUser);
      expect(harness.component.contactInfoMode).toBe('edit');
      expect(toastrStub.error).toHaveBeenCalled();
    }));
  });
});
