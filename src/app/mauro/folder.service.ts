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
import { catchError, map, Observable, throwError } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { FolderDetail, FolderDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { HttpErrorResponse } from '@angular/common/http';
import { ContainerUpdatePayload } from '@maurodatamapper/mdm-resources';
@Injectable({
  providedIn: 'root',
})
export class FolderService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Update folder with new details
   *
   * @param parentId - unique Id of folders parent folder
   * @param payload - values to be updated
   * @returns an observable containing the folderDetail object edited folder
   */
  update(id: Uuid, payload: ContainerUpdatePayload): Observable<FolderDetail> {
    return this.endpoints.folder
      .update(id, payload)
      .pipe(map((response: FolderDetailResponse) => response.body));
  }
}
