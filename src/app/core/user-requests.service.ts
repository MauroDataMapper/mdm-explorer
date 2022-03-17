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
import { DataModelDetail, DataModelIndexResponse } from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources/lib/es2015/mdm-folder.model';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FolderService } from './folder.service';
import { DataModelService } from '../catalogue/data-model.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private folderService: FolderService,
    private endpoints: MdmEndpointsService,
    private dataModelService: DataModelService
  ) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   *
   * @param username - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getUserRequestsFolder(username: string): Observable<FolderDetail> {
    return this.folderService.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folderService.getOrCreateChildOf(
          rootFolder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          this.sanitiseUsername(username)
        );
      })
    );
  }

  get(username: string): Observable<DataModelDetail[]> {
    let dataModelCalls: Observable<DataModelDetail>[];
    this.getUserRequestsFolder(username)
      .pipe(
        switchMap((userRequestsFolder: FolderDetail) => {
          return this.endpoints.dataModel.listInFolder(
            userRequestsFolder.id!
          ) as Observable<DataModelIndexResponse>;
        }),
        map((response: DataModelIndexResponse) => response.body)
      )
      .subscribe((dataModelIndex) => {});
    return of([]);
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
