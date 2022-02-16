import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { UserDetails } from '../security/user-details.service';
import { BroadcastService } from './broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private broadcast: BroadcastService,
    private endpoints: MdmEndpointsService
  ) {}

  /**
   * Ensure the data access requests folder exists for the signed in user.
   * @param user - the details of the signed in user
   */
  ensureUserRequestsFolderExists(user: UserDetails): void {
    let folderId = this.encodeUsername(user.userName);
    this.folderExists(folderId).subscribe((exists: Boolean) => {
      if (exists) return;
      this.makeFolder(folderId);
    });
  }

  /**
   * Make folder with the given folderId.
   * @param folderId - unique Id for folder
   */
  private makeFolder(folderId: string): void {
    // PUT: folder with encoded username
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   * @param username
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  private encodeUsername(username: string): string {
    return username.replace('@', '[at]');
  }

  /**
   * Checks whether a folder exists.
   * @returns An observable that returns `true` if the folder exists, 'false' if not.
   */
  private folderExists(folderId: string): Observable<boolean> {
    // GET: folder with given folderId
    //  this.endpoints.folder.get(folderId).subscribe();
    return of(true);
  }
}
