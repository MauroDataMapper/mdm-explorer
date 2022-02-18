import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../security/user-details.service';
import { FolderService } from './folder.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(private folderService: FolderService) {}

  /**
   * Ensure the data access requests folder exists for the signed in user.
   * @param user - the details of the signed in user
   */
  ensureUserRequestsFolderExists(user: UserDetails): void {
    // ensure root requests folder exists
    this.folderService.ensureExists(environment.rootRequestFolder);
    this.folderService.ensureExists(this.getUserRequestsFolderPath(user.userName));
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

  private getUserRequestsFolderPath(username: string): string {
    return `${environment.rootRequestFolder}/${this.sanitiseUsername(username)}`;
  }
}
