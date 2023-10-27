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
        this.stateRouter.navigateTo(['/sde']);
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
        this.stateRouter.navigateTo(['/sde']);
      })
    );
  }
}
