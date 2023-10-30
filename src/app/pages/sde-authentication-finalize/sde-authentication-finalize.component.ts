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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, catchError, delay, map, of, switchMap, tap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SdeEndpointsService } from 'src/app/secure-data-environment/sde-endpoints.service';
import { UserDetailsService } from 'src/app/security/user-details.service';

type AuthenticationFinalizeAction =
  | ''
  | 'sign-in-success'
  | 'sign-in-failed'
  | 'sign-out';

@Component({
  selector: 'mdm-sde-authentication-finalize',
  templateUrl: './sde-authentication-finalize.component.html',
  styleUrls: ['./sde-authentication-finalize.component.scss'],
})
export class SdeAuthenticationFinalizeComponent implements OnInit {
  action: AuthenticationFinalizeAction = '';
  finalizing = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private sdeEndpoints: SdeEndpointsService,
    private userDetails: UserDetailsService,
    private stateRouter: StateRouterService
  ) {}

  get heading(): string {
    if (this.action === 'sign-in-success' || this.action === 'sign-in-failed') {
      return 'Completing sign in, please wait...';
    }

    if (this.action === 'sign-out') {
      return 'Completing sign out, please wait...';
    }

    return '';
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map((params) => params.action as AuthenticationFinalizeAction),
        switchMap((action) => {
          this.action = action;

          if (this.action === 'sign-in-success') {
            return this.signInSuccess();
          }

          if (this.action === 'sign-in-failed') {
            return this.signInFailed();
          }

          if (this.action === 'sign-out') {
            return this.signOut();
          }

          return EMPTY;
        })
      )
      .subscribe(() => {
        this.finalizing = false;
      });
  }

  signInSuccess() {
    // At this point, the backend should have returned an authorization cookie.
    // This means calling this secure endpoint should work (if it doesn't, then the
    // user clearly isn't logged in!)
    return this.sdeEndpoints.authentication.getUserDetails().pipe(
      catchError((error) => {
        this.errorMessage = error.message;
        return EMPTY;
      }),
      tap((user) => {
        if (!user) {
          this.errorMessage = 'Could not find your user details';
          return;
        }

        this.userDetails.setSdeResearchUser(user);
        this.stateRouter.navigateTo(['/dashboard']);
      })
    );
  }

  signInFailed() {
    return of({}).pipe(
      delay(1000),
      tap(() => {
        this.errorMessage = 'There was a problem signing in';
      })
    );
  }

  signOut() {
    return of({}).pipe(
      delay(1000),
      tap(() => {
        this.userDetails.clearSdeResearchUser();
        this.stateRouter.navigateToKnownPath('/home');
      })
    );
  }
}
