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
import { StaticContentComponent } from './static-content/static-content.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { BrowseComponent } from './browse/browse.component';
import { SearchListingComponent } from './search-listing/search-listing.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { SearchComponent } from './search/search.component';
import { Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { AuthorizedGuard } from '../security/guards/authorized.guard';

export const buildStaticContentRoute = (path: string, staticAssetPath: string): Route => {
  return {
    path,
    component: StaticContentComponent,
    data: {
      staticAssetPath,
    },
  };
};

/**
 * Custom route matcher to match 'page/:path' route, where ':path' could include further URL segments
 * to produce a non-deterministic URL slug.
 */
const dynamicStaticPageMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
  if (segments.length === 0) {
    return null;
  }

  if (segments[0].path.localeCompare('page', undefined, { sensitivity: 'base' }) !== 0) {
    return null;
  }

  return {
    consumed: segments,
    posParams: {
      path: new UrlSegment(segments.slice(1).join('/'), {}),
    },
  };
};

export const routes: Route[] = [
  buildStaticContentRoute('', 'home'),
  buildStaticContentRoute('home', 'home'),
  buildStaticContentRoute('about', 'about'),
  {
    matcher: dynamicStaticPageMatcher,
    component: StaticContentComponent,
  },
  {
    path: 'sign-in',
    component: SignInComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'browse',
    component: BrowseComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'search/listing',
    component: SearchListingComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'account',
    component: MyAccountComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'bookmarks',
    component: BookmarkComponent,
    canActivate: [AuthorizedGuard],
  },
];
