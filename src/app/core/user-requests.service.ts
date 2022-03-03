import { Injectable } from '@angular/core';
import { FolderDetail } from '@maurodatamapper/mdm-resources/lib/es2015/mdm-folder.model';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../security/user-details.service';
import { FolderService } from './folder.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(private folderService: FolderService) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   * @param username - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getUserRequestsFolder(username: string): Observable<FolderDetail> {
    return this.folderService.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folderService.getOrCreateChildOf(
          rootFolder.id!,
          this.sanitiseUsername(username)
        );
      })
    );
  }

  /**
   * Ensure the data access requests folder exists for the signed in user.
   * @param user - the details of the signed in user
   */
  ensureUserRequestsFolderExists(user: UserDetails): void {
    const userRequestFolderName = this.sanitiseUsername(user.userName);
    this.getUserRequestsFolder(userRequestFolderName).subscribe();
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   * @param username
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  private sanitiseUsername(username: string): string {
    return username.replace('@', '[at]');
  }
}
