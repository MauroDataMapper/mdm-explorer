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
import { Injectable } from '@angular/core';
import { DataModel } from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources/lib/es2015/mdm-folder.model';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FolderService } from './folder.service';
import { DataModelService } from '../catalogue/data-model.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private folderService: FolderService,
    private dataModel: DataModelService
  ) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   *
   * @param userEmail - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getRequestsFolder(userEmail: string): Observable<FolderDetail> {
    return this.folderService.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folderService.getOrCreateChildOf(
          rootFolder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          this.getDataRequestsFolderName(userEmail)
        );
      })
    );
  }

  /**
   * Lists all of the users requests as DataModel objects.
   *
   * @param userEmail the username of the user.
   * @returns an observable containing an array of dataModels (the users requests)
   */
  list(userEmail: string): Observable<DataModel[]> {
    return this.getRequestsFolder(userEmail).pipe(
      switchMap((requestsFolder: FolderDetail): Observable<DataModel[]> => {
        return this.dataModel.listInFolder(requestsFolder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      })
    );
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   *
   * @param userEmail
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  private getDataRequestsFolderName(userEmail: string): string {
    return userEmail.replace('@', '[at]');
  }
}
