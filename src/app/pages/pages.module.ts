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
import { BookmarkComponent } from './bookmark/bookmark.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SharedModule } from '../shared/shared.module';
import { SecurityModule } from '../security/security.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { StaticContentComponent } from './static-content/static-content.component';
import { BrowseComponent } from './browse/browse.component';
import { SearchListingComponent } from './search-listing/search-listing.component';
import { SearchComponent } from './search/search.component';
<<<<<<< HEAD
import { MyAccountComponent } from './my-account/my-account.component';
import { CoreModule } from '../core/core.module';
import { SearchModule } from '../search/search.module';
=======
import { DashboardComponent } from './dashboard/dashboard.component';
>>>>>>> mc-9822 - add initial scaffolding for dashboard page.

@NgModule({
  declarations: [
    BookmarkComponent,
    SignInComponent,
    ForgotPasswordComponent,
    StaticContentComponent,
    BrowseComponent,
    SearchListingComponent,
    MyAccountComponent,
    SearchComponent,
    DashboardComponent,
  ],
  imports: [CoreModule, SharedModule, SecurityModule, SearchModule],
})
export class PagesModule {}
