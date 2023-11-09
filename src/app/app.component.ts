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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  map,
  Observable,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { environment } from '../environments/environment';
import { BroadcastEvent, BroadcastService } from './core/broadcast.service';
import { StateRouterService } from './core/state-router.service';
import { DataSpecificationService } from './data-explorer/data-specification.service';
import { ErrorService } from './pages/error/error.service';
import { MdmHttpError } from './mauro/mauro.types';
import { SecurityService } from './security/security.service';
import { UserDetails, UserDetailsService } from './security/user-details.service';
import { FooterLink } from './shared/footer/footer.component';
import { HeaderImageLink, HeaderLink } from './shared/header/header.component';
import { UserIdleService } from './external/user-idle.service';
import { ThemeService } from './shared/theme.service';
import { AuthToken } from './security/security.types';

@Component({
  selector: 'mdm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mdm-explorer';

  isLoading = false;
  loadingCaption = '';

  unsentDataSpecificationsCount = 0;

  signedInUserProfileImageSrc?: string;

  signedInUser?: UserDetails | null;

  logoLink: HeaderImageLink = {
    label: 'Mauro Data Explorer',
    routerLink: '',
    defaultImageSrc: 'assets/images/mauro-data-explorer.svg',
  };

  helpMenuLinks: HeaderLink[] = [
    {
      label: 'How to videos and guides',
      routerLink: '/help',
    },
    {
      label: 'Glossary',
      routerLink: '',
    },
    {
      label: 'Lorem ipsum',
      routerLink: '',
    },
    {
      label: 'FAQs',
      routerLink: '',
    },
    {
      label: 'Contact and support',
      routerLink: '/contact',
    },
  ];

  headerLinks: HeaderLink[] = [
    {
      label: 'About',
      routerLink: '/about',
    },
    {
      label: 'Browse',
      routerLink: '/browse',
      onlySignedIn: true,
    },
    {
      label: 'Search',
      routerLink: '/search',
      onlySignedIn: true,
    },
    {
      label: 'Templates',
      routerLink: '/templates',
      onlySignedIn: true,
    },
    {
      label: 'SDE',
      routerLink: '/sde',
      onlySignedIn: true,
    },
    {
      label: 'Help',
      routerLink: '/help',
      arrow: 'angle-down',
      menuLinks: this.helpMenuLinks,
    },
  ];

  headerRightLinks: HeaderImageLink[] = [
    {
      label: 'Bookmarks',
      routerLink: '/bookmarks',
      defaultImageSrc: '',
    },
  ];

  accountLink: HeaderLink = {
    label: 'My Data Specifications',
    routerLink: '/dataSpecifications',
    arrow: 'angle-down',
  };

  signInLink: HeaderLink = {
    routerLink: '/sign-in',
    label: 'Sign in',
  };

  footerLinks: FooterLink[] = [
    {
      label: 'Privacy policy',
      routerLink: '/about',
      target: '_self',
    },
    {
      label: 'Terms and conditions',
      routerLink: '/terms-and-conditions',
      target: '_self',
    },
    {
      label: 'Cookies',
      routerLink: '/cookie-policy',
      target: '_self',
    },
    {
      label: 'Safeguarding',
      routerLink: '/safeguarding',
      target: '_self',
    },
    {
      label: 'Site map',
      routerLink: '/sitemap',
      target: '_self',
    },
  ];

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private broadcast: BroadcastService,
    private security: SecurityService,
    private userDetails: UserDetailsService,
    private dataSpecification: DataSpecificationService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private userIdle: UserIdleService,
    private error: ErrorService,
    private themes: ThemeService,
  ) {
    // Load the theme into the DOM as the first thing to do
    this.themes.loadTheme().subscribe((theme) => {
      this.themes.applyTheme(theme);
      this.logoLink.customImageSrc = theme.images.header.logo.url;
    });
  }

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
          'Unfortunately there was a problem with connectivity. Please try again later.',
        ),
      );

    this.broadcast
      .onUserSignedIn()
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap((signedInUser: UserDetails) => {
          return this.attemptToSignInAndSetupSdeUser(signedInUser);
        }),
        switchMap((signedInUser) => {
          this.setupSignedInUser(signedInUser);
          return this.getUnsentDataSpecificationCount();
        }),
        map(
          (unsentDataSpecificationsCount) =>
            (this.unsentDataSpecificationsCount = unsentDataSpecificationsCount),
        ),
      )
      .subscribe(() => {});

    this.broadcast
      .on('sign-out-user')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.signOutUser());

    const user = this.userDetails.get();
    if (user) {
      this.setupSignedInUser(user);
      this.getUnsentDataSpecificationCount().subscribe(
        (unsentDataSpecificationsCount) =>
          (this.unsentDataSpecificationsCount = unsentDataSpecificationsCount),
      );
    }

    this.signedInUser = user;

    this.subscribeHttpErrorEvent('http-not-authorized', '/not-authorized');
    this.subscribeHttpErrorEvent('http-not-found', '/not-found');
    this.subscribeHttpErrorEvent('http-not-implemented', '/not-implemented');
    this.subscribeHttpErrorEvent('http-server-error', '/server-error');

    this.subscribeDataSpecificationChanges();

    this.broadcast
      .onLoading()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((payload) => {
        this.isLoading = payload.isLoading;
        this.loadingCaption = payload.caption ?? '';
      });

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
            `There was a problem signing out: ${error.response.status} ${error.response.message}`,
          );
          return EMPTY;
        }),
        finalize(() => {
          this.setupSignedInUser(null);
          this.stateRouter.navigateToKnownPath('');
        }),
      )
      .subscribe(() => {});
  }

  private attemptToSignInAndSetupSdeUser(user: UserDetails): Observable<UserDetails> {
    return this.security.signInToSde(user.email).pipe(
      map((sdeAuthToken: AuthToken) => {
        // Save to userDetails. If empty, no token was returned.
        user.sdeAuthToken = sdeAuthToken.token;
        this.userDetails.set(user);

        return user;
      }),
    );
  }

  private subscribeHttpErrorEvent(event: BroadcastEvent, state: string) {
    this.broadcast
      .on<HttpErrorResponse>(event)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        this.error.lastError = response;
        this.stateRouter.navigateTo([state]);
      });
  }

  private setupSignedInUser(user?: UserDetails | null) {
    this.signedInUserProfileImageSrc = user
      ? `${environment.mauroCoreEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
    this.signedInUser = user;
    this.signedInUserProfileImageSrc = user
      ? `${environment.mauroCoreEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
  }

  private getUnsentDataSpecificationCount() {
    return this.dataSpecification.list().pipe(
      catchError(() => {
        this.toastr.error(
          'There was a problem locating your current data specifications.',
        );
        return EMPTY;
      }),
      map((dataSpecifications) => {
        return dataSpecifications.filter(
          (specification) => specification.status === 'unsent',
        ).length;
      }),
    );
  }

  private subscribeDataSpecificationChanges() {
    this.broadcast
      .on('data-specification-added')
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.getUnsentDataSpecificationCount()),
        map(
          (unsentDataSpecificationsCount) =>
            (this.unsentDataSpecificationsCount = unsentDataSpecificationsCount),
        ),
      )
      .subscribe(() => {});

    this.broadcast
      .on('data-specification-submitted')
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.getUnsentDataSpecificationCount()),
        map(
          (unsentDataSpecificationsCount) =>
            (this.unsentDataSpecificationsCount = unsentDataSpecificationsCount),
        ),
      )
      .subscribe(() => {});
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
        this.toastr.info('Your session has expired! Please sign in.');
        this.signOutUser();
      });
  }
}
