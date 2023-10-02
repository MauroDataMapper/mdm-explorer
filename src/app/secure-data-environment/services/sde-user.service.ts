import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthToken } from 'src/app/security/security.types';
import { UserEndpoints } from '../endpoints/user.endpoints';

@Injectable({
  providedIn: 'root',
})
export class SdeUserService {
  constructor(private userEndpoints: UserEndpoints) { }

  /**
   * Attempt to log the current user into the SDE.
   *
   */
  getSdeAuthToken(email: string): Observable<AuthToken> {
    return this.userEndpoints.impersonate(email).pipe(
      map((sdeAuthToken: AuthToken) => {
        return sdeAuthToken;
      })
    );
  }
}
