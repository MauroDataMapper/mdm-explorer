import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { FolderDetail, FolderDetailResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  constructor(private endpoints: MdmEndpointsService) {}

  // TODO: get folder by path - "fo:My Folder" ... "fo:root-folder-name/user-requests-folder"
  // TODO: if folder found,return FolderDetail observable
  // TODO if 404, create then return
  // TODO if error, rethrow
  // Endpoint for paths: (might need to add to existing endpoints service)
  // MdmCatalogueItemResource.getPath()
  // MdmCatalogueItemResource.getPathFromParent()
  /**
   * Get the root level folder having this Id and create a new one using the
   * supplied label if no such folder exists
   * @param folderId - unique ID of folder
   * @param label - name of folder
   * @returns - folderDetail object for retrieved or created folder
   */
  getOrCreate(folderId: Uuid, label: string): Observable<FolderDetail> {
    return this.endpoints.folder.get(folderId, {}, { handleGetErrors: false }).pipe(
      catchError((error: HttpErrorResponse) => {
        return error.status === 404
          ? this.createAndGetRootLevelFolder(label)
          : throwError(() => error);
      }),
      map((response: FolderDetailResponse) => response.body)
    );
  }

  /**
   *
   * @param folderId - unique Id of folder
   * @param parentId - unique Id of folders parent folder
   * @param label - label to be used should a new folder be created
   * @returns - an observable containing a FolderDetail object
   */
  getOrCreateChildOf(
    folderId: Uuid,
    parentId: Uuid,
    label: string
  ): Observable<FolderDetail> {
    return this.endpoints.folder
      .getChildOf(parentId, folderId, {}, { handleGetErrors: false })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return error.status === 404
            ? this.createAndGetChild(parentId, label)
            : throwError(() => error);
        }),
        map((response: FolderDetailResponse) => response.body)
      );
  }

  private createAndGetRootLevelFolder(label: string): Observable<FolderDetail> {
    return this.endpoints.folder
      .save({ label: label })
      .pipe(map((response: FolderDetailResponse) => response.body));
  }

  private createAndGetChild(parentId: Uuid, label: string): Observable<FolderDetail> {
    return this.endpoints.folder
      .saveChildrenOf(parentId, { label: label })
      .pipe(map((response: FolderDetailResponse) => response.body));
  }
}
