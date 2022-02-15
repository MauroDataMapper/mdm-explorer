import { Injectable } from '@angular/core';
import { MdmFolderResource } from '@maurodatamapper/mdm-resources';
import { Observable, of, pipe } from 'rxjs';
import { UserDetails } from '../security/user-details.service';
import { BroadcastService } from './broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private broadcast: BroadcastService,
    private folder: MdmFolderResource
  ) {}

  /**
   * Check for existence of or create folder for storing researcher
   * requests for data access.
   */
  ensureDataAccessRequestsFolderExists(): void {
    this.broadcast.onUserSignedIn().subscribe(pipe());
    // pipe result and grab user info to ping server to see if folder exists

    // pipe resulting T/F response to determine whether or not folder needs to be created

    // if no, finish here

    // if yes, one last call to api to create folder

    // pipe result into error catch
  }

  /**
   * Encode username to allow for use as a folder name in the backend.
   * @param username
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  encodeUsername(username: string): string {
    return username.replace('@', '[at]');
  }

  /**
   * Checks whether a folder exists.
   * @returns An observable that returns `true` if the folder exists, 'false' if not.
   */
  folderExists(folderId: string): Observable<boolean> {
    return of(true);
  }
}
