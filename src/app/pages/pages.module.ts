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
import { NgModule } from '@angular/core';
import { MyBookmarksComponent } from './my-bookmarks/my-bookmarks.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SharedModule } from '../shared/shared.module';
import { SecurityModule } from '../security/security.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StaticContentComponent } from './static-content/static-content.component';
import { BrowseComponent } from './browse/browse.component';
import { DataElementComponent } from './data-element/data-element.component';
import { DataElementProfileComponent } from './data-element/data-element-profile/data-element-profile.component';
import { SearchListingComponent } from './search-listing/search-listing.component';
import { SearchComponent } from './search/search.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { CoreModule } from '../core/core.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './home/home.component';
import { ContactSupportComponent } from './contact-support/contact-support.component';
import { ErrorComponent } from './error/error.component';
import { NotImplementedComponent } from './error/not-implemented/not-implemented.component';
import { NotAuthorizedComponent } from './error/not-authorized/not-authorized.component';
import { NotFoundComponent } from './error/not-found/not-found.component';
import { ServerErrorComponent } from './error/server-error/server-error.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { DataExplorerModule } from '../data-explorer/data-explorer.module';

@NgModule({
  declarations: [
    ErrorComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    NotFoundComponent,
    ServerErrorComponent,
    MyBookmarksComponent,
    SignInComponent,
    ForgotPasswordComponent,
    StaticContentComponent,
    BrowseComponent,
    DataElementComponent,
    DataElementProfileComponent,
    SearchListingComponent,
    MyAccountComponent,
    SearchComponent,
    DashboardComponent,
    HomeComponent,
    ContactSupportComponent,
  ],
  imports: [
    CoreModule,
    SharedModule,
    SecurityModule,
    DataExplorerModule,
    NgxJsonViewerModule,
  ],
})
export class PagesModule {}
