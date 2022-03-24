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
import { DataModel, DataModelIndexResponse } from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources/lib/es2015/mdm-folder.model';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { map, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FolderService } from './folder.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private folderService: FolderService,
    private endpoints: MdmEndpointsService
  ) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   *
   * @param username - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getRequestsFolder(username: string): Observable<FolderDetail> {
    return this.folderService.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folderService.getOrCreateChildOf(
          rootFolder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          this.sanitiseUsername(username)
        );
      })
    );
  }

  /**
   * Lists all of the users requests as DataModel objects.
   *
   * @param username the username of the user.
   * @returns an observable containing an array dataModels (the users requests)
   */
  list(username: string): Observable<DataModel[]> {
    return this.getRequestsFolder(username).pipe(
      switchMap((requestsFolder: FolderDetail): Observable<DataModelIndexResponse> => {
        return this.endpoints.dataModel.listInFolder(requestsFolder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      map((response) => response.body.items)
    );
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   *
   * @param username
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  private sanitiseUsername(username: string): string {
    return username.replace('@', '[at]');
  }
}
