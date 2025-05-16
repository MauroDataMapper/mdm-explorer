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
import {
  DataRequestDefinition,
  IdNamePair,
  KeyValuePair,
  NewProjectEnquiryRequestDefinition,
  NewProjectRequestDefinition,
  ProjectChangeRequestDefinition,
  QueryParameter,
  RequestDefinition,
  RequestResponse,
  RequestType,
  RequestUserRole,
  SdeRequest,
  SdeRequestExtended,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

/*
  getDepartmentIdOrEmpty(requestUpdate: SdeRequest) {  }

  getProjectIdOrEmpty(requestUpdate: SdeRequest) {  }

  getTypeDisplayName(type: RequestType) {  }

  createRequestDefinition(
    type: RequestType,
  ):
    | DataRequestDefinition
    | NewProjectRequestDefinition
    | NewProjectEnquiryRequestDefinition
    | ProjectChangeRequestDefinition
    | RequestDefinition { }

  convertToSdeRequest(requestResponse: RequestResponse): SdeRequest {  }

  createRequestResponse(type: RequestType, parent?: IdNamePair): RequestResponse { }

  getLatestComment(requestId: string): Observable<string> {  }

  fetchFilteredRequestsWithStatusNames(
    queryParameters: QueryParameter[],
  ): Observable<SdeRequestExtended[]> {  }

  getMauroId(requestResponse: RequestResponse): string | undefined { }

  getMauroIdDataOverride(mauroId: Uuid, mauroLabel: string): KeyValuePair {}

  setMauroId(mauroId: Uuid, mauroLabel: string, requestResponse: RequestResponse) {}

  listDraftNewProjectRequests(): Observable<SdeRequest[]> {  }

  listDraftProjectChangeRequests(): Observable<SdeRequest[]> {  }
*/

export type DoCreateRequestDialogFn = (userRole: RequestUserRole) => void;
export type ShowRequestResponseFn = (
  requestResponse: RequestResponse,
  userRole: RequestUserRole
) => void;
export type RefreshRequestListsFn = (data?: any) => void;
export type RefreshRequestUpdateListFn = () => void;

export type GetDepartmentIdOrEmptyFn = (requestUpdate: SdeRequest) => void;
export type GetProjectIdOrEmptyFn = (requestUpdate: SdeRequest) => void;
export type GetTypeDisplayNameFn = (type: RequestType) => void;
export type CreateRequestDefinitionFn = (
  type: RequestType
) =>
  | DataRequestDefinition
  | NewProjectRequestDefinition
  | NewProjectEnquiryRequestDefinition
  | ProjectChangeRequestDefinition
  | RequestDefinition;
export type ConvertToSdeRequestFn = (requestResponse: RequestResponse) => SdeRequest;
export type CreateRequestResponseFn = (type: RequestType, parent?: IdNamePair) => RequestResponse;
export type GetLatestCommentFn = (requestId: string) => Observable<string>;
export type FetchFilteredRequestsWithStatusNamesFn = (
  queryParameters: QueryParameter[]
) => Observable<SdeRequestExtended[]>;
export type GetMauroIdFn = (requestResponse: RequestResponse) => string | undefined;
export type GetMauroIdDataOverrideFn = (mauroId: Uuid, mauroLabel: string) => KeyValuePair;
export type SetMauroIdFn = (
  mauroId: Uuid,
  mauroLabel: string,
  requestResponse: RequestResponse
) => void;
export type ListDraftNewProjectRequestsFn = () => Observable<SdeRequest[]>;
export type ListDraftProjectChangeRequestsFn = () => Observable<SdeRequest[]>;

export interface RequestServiceStub {
  doCreateRequestDialog: jest.MockedFunction<DoCreateRequestDialogFn>;
  showRequestResponse: jest.MockedFunction<ShowRequestResponseFn>;
  refreshRequestLists: jest.MockedFunction<RefreshRequestListsFn>;
  refreshRequestUpdateList: jest.MockedFunction<RefreshRequestUpdateListFn>;
  getDepartmentIdOrEmpty: jest.MockedFunction<GetDepartmentIdOrEmptyFn>;
  getProjectIdOrEmpty: jest.MockedFunction<GetProjectIdOrEmptyFn>;
  getTypeDisplayName: jest.MockedFunction<GetTypeDisplayNameFn>;
  createRequestDefinition: jest.MockedFunction<CreateRequestDefinitionFn>;
  convertToSdeRequest: jest.MockedFunction<ConvertToSdeRequestFn>;
  createRequestResponse: jest.MockedFunction<CreateRequestResponseFn>;
  getLatestComment: jest.MockedFunction<GetLatestCommentFn>;
  fetchFilteredRequestsWithStatusNames: jest.MockedFunction<FetchFilteredRequestsWithStatusNamesFn>;
  getMauroId: jest.MockedFunction<GetMauroIdFn>;
  getMauroIdDataOverride: jest.MockedFunction<GetMauroIdDataOverrideFn>;
  setMauroId: jest.MockedFunction<SetMauroIdFn>;
  listDraftNewProjectRequests: jest.MockedFunction<ListDraftNewProjectRequestsFn>;
  listDraftProjectChangeRequests: jest.MockedFunction<ListDraftProjectChangeRequestsFn>;
}

export const createRequestServiceStub = (): RequestServiceStub => {
  return {
    doCreateRequestDialog: jest.fn() as jest.MockedFunction<DoCreateRequestDialogFn>,
    showRequestResponse: jest.fn() as jest.MockedFunction<ShowRequestResponseFn>,
    refreshRequestLists: jest.fn() as jest.MockedFunction<RefreshRequestListsFn>,
    refreshRequestUpdateList: jest.fn() as jest.MockedFunction<RefreshRequestUpdateListFn>,
    getDepartmentIdOrEmpty: jest.fn() as jest.MockedFunction<GetDepartmentIdOrEmptyFn>,
    getProjectIdOrEmpty: jest.fn() as jest.MockedFunction<GetProjectIdOrEmptyFn>,
    getTypeDisplayName: jest.fn() as jest.MockedFunction<GetTypeDisplayNameFn>,
    createRequestDefinition: jest.fn() as jest.MockedFunction<CreateRequestDefinitionFn>,
    convertToSdeRequest: jest.fn() as jest.MockedFunction<ConvertToSdeRequestFn>,
    createRequestResponse: jest.fn() as jest.MockedFunction<CreateRequestResponseFn>,
    getLatestComment: jest.fn() as jest.MockedFunction<GetLatestCommentFn>,
    fetchFilteredRequestsWithStatusNames:
      jest.fn() as jest.MockedFunction<FetchFilteredRequestsWithStatusNamesFn>,
    getMauroId: jest.fn() as jest.MockedFunction<GetMauroIdFn>,
    getMauroIdDataOverride: jest.fn() as jest.MockedFunction<GetMauroIdDataOverrideFn>,
    setMauroId: jest.fn() as jest.MockedFunction<SetMauroIdFn>,
    listDraftNewProjectRequests: jest.fn() as jest.MockedFunction<ListDraftNewProjectRequestsFn>,
    listDraftProjectChangeRequests:
      jest.fn() as jest.MockedFunction<ListDraftProjectChangeRequestsFn>,
  };
};
