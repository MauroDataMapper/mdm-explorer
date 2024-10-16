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
import { StaticContentComponent } from './static-content/static-content.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { BrowseComponent } from './browse/browse.component';
import { SearchListingComponent } from './search-listing/search-listing.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyBookmarksComponent } from './my-bookmarks/my-bookmarks.component';
import { SearchComponent } from './search/search.component';
import { DataElementComponent } from './data-element/data-element.component';
import { Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { AuthorizedGuard } from '../security/guards/authorized.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ContactSupportComponent } from './contact-support/contact-support.component';
import { NotImplementedComponent } from './error/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from './error/not-authorized/not-authorized.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { MyDataSpecificationsComponent } from './my-data-specifications/my-data-specifications.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DataSpecificationQueryComponent } from './data-specification-query/data-specification-query.component';
import { ModelPageDirtyGuard } from '../shared/guards/model-page-dirty.guard';
import { MyDataSpecificationDetailComponent } from './my-data-specification-detail/my-data-specification-detail.component';
import { TemplateDataSpecificationsComponent } from './template-data-specifications/template-data-specifications.component';
import { TemplateDataSpecificationDetailComponent } from './template-data-specification-detail/template-data-specification-detail.component';
import { SdeMainComponent } from './sde-main/sde-main.component';
import { SdeAuthenticationFinalizeComponent } from './sde-authentication-finalize/sde-authentication-finalize.component';

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
  buildStaticContentRoute('about', 'about'),
  buildStaticContentRoute('help', 'help'),
  {
    matcher: dynamicStaticPageMatcher,
    component: StaticContentComponent,
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'contact',
    component: ContactSupportComponent,
  },
  {
    path: 'not-implemented',
    component: NotImplementedComponent,
  },
  {
    path: 'not-authorized',
    component: NotAuthorizedComponent,
  },
  {
    path: 'server-error',
    component: ServerErrorComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
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
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthorizedGuard],
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
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'bookmarks',
    component: MyBookmarksComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'dataElement/:dataModelId/:dataClassId/:dataElementId',
    component: DataElementComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'dataSpecifications',
    component: MyDataSpecificationsComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'dataSpecifications/:dataSpecificationId/queries/:queryType',
    component: DataSpecificationQueryComponent,
    canActivate: [AuthorizedGuard],
    canDeactivate: [ModelPageDirtyGuard],
  },
  {
    path: 'dataSpecifications/:dataSpecificationId',
    component: MyDataSpecificationDetailComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'templates',
    component: TemplateDataSpecificationsComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'templates/:dataSpecificationId',
    component: TemplateDataSpecificationDetailComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'sde',
    component: SdeMainComponent,
    canActivate: [AuthorizedGuard],
  },
  {
    path: 'sde/auth/finalize/:action',
    component: SdeAuthenticationFinalizeComponent,
  },
];
