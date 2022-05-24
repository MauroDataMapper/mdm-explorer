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
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, filter, finalize, map, Subject, takeUntil } from 'rxjs';
import { environment } from '../environments/environment';
import { BroadcastEvent, BroadcastService } from './core/broadcast.service';
import { StateRouterService } from './core/state-router.service';
import { DataRequestsService } from './data-explorer/data-requests.service';
import { ErrorService } from './pages/error/error.service';
import { MdmHttpError } from './mauro/mauro.types';
import { SecurityService } from './security/security.service';
import { UserDetails, UserDetailsService } from './security/user-details.service';
import { FooterLink } from './shared/footer/footer.component';
import { HeaderImageLink, HeaderLink } from './shared/header/header.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { UserIdleService } from './external/user-idle.service';

@Component({
  selector: 'mdm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'mdm-explorer';

  themeCssSelector = 'default-theme';

  isLoading = false;
  loadingCaption = '';

  unsentRequestsCount = 0;

  signedInUserProfileImageSrc?: string;

  signedInUser?: UserDetails | null;

  logoLink: HeaderImageLink = {
    label: 'Mauro Data Explorer',
    routerLink: '',
    imageSrc: 'assets/images/mauro-data-explorer.svg',
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
      imageSrc: '',
    },
  ];

  accountLink: HeaderLink = {
    label: 'My requests',
    routerLink: '/requests',
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
    private dataRequests: DataRequestsService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private userIdle: UserIdleService,
    private error: ErrorService,
    private overlayContainer: OverlayContainer
  ) {}

  @HostListener('window:mousemove', ['$event'])
  onMouseMove() {
    this.userIdle.resetTimer();
  }

  ngOnInit(): void {
    this.setTheme();

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
      .subscribe((userSignedIn) => {
        this.setupSignedInUser(userSignedIn);
        this.getRequestsInfo();
      });

    this.broadcast
      .on('sign-out-user')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.signOutUser());

    const user = this.userDetails.get();
    if (user) {
      this.setupSignedInUser(user);
      this.getRequestsInfo();
    }

    this.signedInUser = user;

    this.subscribeHttpErrorEvent('http-not-authorized', '/not-authorized');
    this.subscribeHttpErrorEvent('http-not-found', '/not-found');
    this.subscribeHttpErrorEvent('http-not-implemented', '/not-implemented');
    this.subscribeHttpErrorEvent('http-server-error', '/server-error');

    this.subscribeDataRequestChanges();

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
            `There was a problem signing out: ${error.response.status} ${error.response.message}`
          );
          return EMPTY;
        }),
        finalize(() => {
          this.setupSignedInUser(null);
          this.stateRouter.navigateToKnownPath('');
        })
      )
      .subscribe(() => {});
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
      ? `${environment.apiEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
    this.signedInUser = user;
    this.signedInUserProfileImageSrc = user
      ? `${environment.apiEndpoint}/catalogueUsers/${user.id}/image`
      : undefined;
  }

  /**
   * Check how many current requests user has pending.
   */
  private getRequestsInfo() {
    this.dataRequests
      .list()
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem locating your current requests.');
          return EMPTY;
        }),
        map((requests) => {
          return requests.filter((req) => req.status === 'unsent').length;
        })
      )
      .subscribe((unsentRequestsCount) => {
        this.unsentRequestsCount = unsentRequestsCount;
      });
  }

  private subscribeDataRequestChanges() {
    this.broadcast
      .on('data-request-added')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.unsentRequestsCount++);

    this.broadcast
      .on('data-request-submitted')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => (this.unsentRequestsCount = Math.max(0, this.unsentRequestsCount - 1))
      );
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

  private setTheme() {
    // Material theme is wrapped inside a CSS class but the overlay container is not part of Angular
    // Material. Have to manually set the correct theme class to this container too
    this.overlayContainer.getContainerElement().classList.add(this.themeCssSelector);
    this.overlayContainer.getContainerElement().classList.add('overlay-container');
  }
}
