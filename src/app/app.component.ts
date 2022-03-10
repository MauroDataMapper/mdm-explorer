/*
Copyright 2022 University of Oxford
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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  Observable,
  Observer,
  Subject,
  takeUntil,
} from 'rxjs';
import { environment } from '../environments/environment';
import { BroadcastEvent, BroadcastService } from './core/broadcast.service';
import { StateRouterService } from './core/state-router.service';
import { UserRequestsService } from './core/user-requests.service';
import { MdmHttpError } from './mdm-rest-client/mdm-rest-client.types';
import { SecurityService } from './security/security.service';
import { UserDetails, UserDetailsService } from './security/user-details.service';
import { FooterLink } from './shared/footer/footer.component';
import { HeaderImageLink, HeaderLink } from './shared/header/header.component';
import { ArrowDirection } from './shared/directives/arrow.directive';
import { arrowDirection } from './shared/pipes/arrow.pipe';

@Component({
  selector: 'mdm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mdm-research-browser';

  numberOfRequests = 0;

  signedInUserProfileImageSrc?: string;

  signedInUser?: UserDetails | null;

  logoLink: HeaderImageLink = {
    label: 'MDM UI Testbed',
    routeName: 'app.container.home',
    imageSrc: 'assets/images/app-logo.png',
  };

  headerLinks: HeaderLink[] = [
    {
      label: 'About',
      routeName: 'app.container.about',
    },
    {
      label: 'Browse',
      routeName: 'app.container.browse',
      onlySignedIn: true,
    },
    {
      label: 'Search',
      routeName: 'app.container.search',
    },
    {
      label: 'Help',
      routeName: 'app.container.help',
      arrow: 'angle-down',
    },
  ];

  headerRightLinks: HeaderImageLink[] = [
    {
      label: 'Bookmarks',
      routeName: 'app.container.my-bookmarks',
      imageSrc: '',
    },
  ];

  accountLink: HeaderLink = {
    label: 'My requests',
    routeName: 'app.container.my-requests',
    arrow: 'angle-down',
  };

  signInLink: HeaderLink = {
    routeName: 'app.container.signin',
    label: 'Sign in',
  };

  footerLinks: FooterLink[] = [
    {
      label: 'Privacy policy',
      routeName: 'app.container.privacy',
      target: '_self',
    },
    {
      label: 'Terms and conditions',
      routeName: 'app.container.terms',
      target: '_self',
    },
    {
      label: 'Cookies',
      routeName: 'app.container.cookies',
      target: '_self',
    },
    {
      label: 'Safeguarding',
      routeName: 'app.container.safeguarding',
      target: '_self',
    },
    {
      label: 'Site map',
      routeName: 'app.container.sitemap',
      target: '_self',
    },
  ];

  // This is a dummy observable. I'm assuming that at some point we will have an obervable/service which actually returns the
  // current number of requests, perhaps running on a timer updating every minute or two. For the moment we just have this
  // which returns a value which increments every 5 seconds.
  private _observeNumberOfRequests = new Observable((observer: Observer<number>) => {
    let requests = 0;
    const timeoutFunction = () => {
      observer.next(requests);
      ++requests;
      setTimeout(timeoutFunction, 5000);
    };
    const timeoutId = setTimeout(timeoutFunction, 0);
    return {
      unsubscribe: () => {
        clearTimeout(timeoutId);
      },
    };
  });

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private broadcast: BroadcastService,
    private security: SecurityService,
    private userDetails: UserDetailsService,
    private userRequests: UserRequestsService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private userIdle: UserIdleService
  ) {}

  @HostListener('window:mousemove', ['$event'])
  onMouseMove() {
    this.userIdle.resetTimer();
  }

  ngOnInit(): void {
    this.broadcast
      .on<HttpErrorResponse>('http-application-offline')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() =>
        this.toastr.warning(
          'Unfortunately there was a problem with connectivity. Please try again later.'
        )
      );

    this.broadcast
      .onUserSignedIn()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((user) => {
        this.setupSignedInUser(user);
        this.userRequests.getUserRequestsFolder(user.userName).subscribe();
      });

    this.broadcast
      .on('sign-out-user')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.signOutUser());

    this.setupSignedInUser(this.userDetails.get());

    this.signedInUser = this.userDetails.get();

    this.subscribeHttpErrorEvent('http-not-authorized', 'app.container.not-authorized');
    this.subscribeHttpErrorEvent('http-not-found', 'app.container.not-found');
    this.subscribeHttpErrorEvent('http-not-implemented', 'app.container.not-implemented');
    this.subscribeHttpErrorEvent('http-server-error', 'app.container.server-error');

    this._observeNumberOfRequests.subscribe(
      (nextNumber) => (this.numberOfRequests = nextNumber)
    );

    // Check immediately if the last authenticated session is expired and setup a recurring
    // check for this
    this.checkSessionExpiry();
    this.setupIdleTimer();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  signOutUser() {
    this.security
      .signOut()
      .pipe(
        catchError((error: MdmHttpError) => {
          console.log(
            `There was a problem signing out: ${error.response.status} ${error.response.message}`
          );
          return EMPTY;
        }),
        finalize(() => {
          this.setupSignedInUser(null);
          this.stateRouter.transitionTo(
            'app.container.default',
            {},
            {
              reload: true,
              inherit: false,
            }
          );
        })
      )
      .subscribe(() => {});
  }

  private subscribeHttpErrorEvent(event: BroadcastEvent, state: string) {
    this.broadcast
      .on<HttpErrorResponse>(event)
      .pipe(takeUntil(this.unsubscribe$))
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .subscribe((response) =>
        this.stateRouter.transition(state, { lastError: response })
      );
  }

  private setupSignedInUser(user?: UserDetails | null) {
    this.signedInUserProfileImageSrc = user
      ? `${environment.apiEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
    this.signedInUser = user;
    this.signedInUserProfileImageSrc = user
      ? `${environment.apiEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
  }

  private setupIdleTimer() {
    this.userIdle.startWatching();
    this.userIdle
      .onTimerStart()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {});

    let lastCheck = new Date();
    this.userIdle
      .onTimeout()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        const now = new Date();

        if (now.valueOf() - lastCheck.valueOf() > environment.checkSessionExpiryTimeout) {
          this.checkSessionExpiry();
          this.userIdle.resetTimer();
        }

        lastCheck = now;
      });
  }

  private checkSessionExpiry() {
    if (!this.security.isSignedIn()) {
      return;
    }

    this.security
      .isCurrentSessionExpired()
      .pipe(filter((authenticated) => !authenticated))
      .subscribe(() => {
        this.toastr.error('Your session has expired! Please sign in.');
        this.signOutUser();
      });
  }
}
