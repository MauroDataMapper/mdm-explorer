import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';

@Injectable({
  providedIn: 'root',
})
export class FolderService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Check whether a folder with the given ID exists.
   * @returns An observable that returns `true` if the folder exists, 'false' if not.
   */
  exists(folderId: string): Observable<boolean> {
    // GET: folder with given folderId
    // this.endpoints.folder.get(folderId).subscribe();
    return of(true);
  }

  /**
   *
   * @param folderId
   */
  ensureExists(folderId: string): void {
    this.endpoints.folder.get(folderId).subscribe();
  }

  /**
   * Make folder with the given folderId.
   * @param folderId - unique Id for folder
   */
  create(folderId: string): void {
    // PUT: folder with encoded username
    // this.endpoints.folder.simplePut() ?
  }

  /**
   * Update the contents of a given folder with the supplied data.
   * @param folderId
   * @param data
   */
  update(folderId: string, data: unknown): void {}
}
