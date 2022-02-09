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
import { BrowserModule } from '@angular/platform-browser';
import { UIRouterModule } from '@uirouter/angular';
import { AppComponent } from './app.component';
import { states, uiRouterConfigFn } from './app.routes';
import { UiViewComponent } from './views/ui-view/ui-view.component';
import { PagesModule } from './pages/pages.module';
import { AppContainerComponent } from './views/app-container/app-container.component';
import { environment } from '../environments/environment';
import { ToastrModule } from 'ngx-toastr';
import { UserIdleModule } from 'angular-user-idle';
import { MdmRestClientModule } from './mdm-rest-client/mdm-rest-client.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorModule } from './error/error.module';
import { OPENID_CONNECT_CONFIG } from './security/security.types';

const getOpenIdAuthorizeUrl = () => {
  // Redirect authorization URL refers to a static page route found in `/src/static-pages`. See the `assets`
  // configuration in `angular.json`.
  //
  // The reason why a static page is used instead of a component route is to avoid the hash location strategy that all
  // component routes use. An Angular component route would include a `#`, which represents a fragment in an absolute URI.
  // URI fragments are not allowed according to [RFC3986] Section 4.3. This was discovered when adding Microsoft
  // Azure Active Directory as an OpenID Connect endpoint.
  //
  // The static page is therefore a landing point so that it can immediately redirect to the correct authentication component
  // route and do the real work.
  const authorizationUrl = '/redirects/open-id-connect-redirect.html';
  const baseUrl = window.location.href.slice(0, window.location.href.indexOf('/#/'));
  return new URL(baseUrl + authorizationUrl).toString();
};

@NgModule({
  declarations: [
    AppComponent,
    AppContainerComponent,
    UiViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    MdmRestClientModule.forRoot({
      apiEndpoint: environment.apiEndpoint,
      defaultHttpRequestOptions: {
        withCredentials: true
      }
    }),
    UIRouterModule.forRoot({
      states,
      config: uiRouterConfigFn,
      useHash: true,
      otherwise: '/not-found'
    }),
    ToastrModule.forRoot({
      timeOut: 30000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: false
    }),
    UserIdleModule.forRoot({
      idle: 600,
      timeout: 300
    }),
    PagesModule,
    ErrorModule
  ],
  providers: [
    {
      provide: OPENID_CONNECT_CONFIG,
      useValue: {
        redirectUrl: getOpenIdAuthorizeUrl()
      }
    }
  ],
  bootstrap: [UiViewComponent]
})
export class AppModule { }
