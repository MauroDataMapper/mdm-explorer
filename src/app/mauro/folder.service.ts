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
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import {
  CatalogueItem,
  ContainerDomainType,
  FolderDetail,
  FolderDetailResponse,
  MdmTreeItemListResponse,
  Securable,
  TreeItemListQueryParameters,
  Uuid,
  Version,
} from '@maurodatamapper/mdm-resources';
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

  treeList(): Observable<MdmTreeItem[]> {
    const queryStringParams: TreeItemListQueryParameters = {
      includeDocumentSuperseded: false,
      includeModelSuperseded: true,
      includeDeleted: false,
      noCache: true,
    };

    return this.endpoints.tree
      .list(ContainerDomainType.Folders, queryStringParams)
      .pipe(map((response: MdmTreeItemListResponse) => response.body));
  }
}

export interface MdmTreeItem extends Required<CatalogueItem>, Securable {
  [key: string]: any;
  label?: string;
  children?: MdmTreeItem[];
  hasChildFolders?: boolean;
  deleted?: boolean;
  finalised?: boolean;
  type?: string;
  parentFolder?: string;
  superseded?: boolean;
  documentationVersion?: Version;
  branchName?: string;
  modelVersion?: Version;
  modelId?: Uuid;
  parentId?: Uuid;
}
export interface TreeItemListParameters {
  includeDocumentSuperseded?: boolean;
  includeModelSupersedd?: boolean;
  includeDeleted?: boolean;
  noCache?: boolean;
}
