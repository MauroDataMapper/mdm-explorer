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
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PagesModule } from './pages/pages.module';
import { environment } from '../environments/environment';
import { ToastrModule } from 'ngx-toastr';
import { MauroModule } from './mauro/mauro.module';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  AUTHORIZATION_REDIRECT_URL,
  OPENID_CONNECT_CONFIG,
} from './security/security.types';
import { STATIC_CONTENT_CONFIGURATION } from './core/static-content.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from './data-explorer/data-explorer.types';
import { CoreModule } from './core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { NgChartsModule } from 'ng2-charts';
import { DataExplorerService } from './data-explorer/data-explorer.service';
import { Observable } from 'rxjs';
import { USER_IDLE_CONFIGURATION } from './external/user-idle.service';
import { LOCALE_ID } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

/**
 * Factory function for app initialization.
 *
 * @param explorer The {@link DataExplorerService} to call to initialise the app.
 * @returns A function that will return an observable of {@link DataExplorerConfiguration}.
 *
 * This factory function should be used with the {@link APP_INITIALIZER} injection token to initialise the
 * app during startup. It will initialise the configuration required for the application to continue functioning.
 */
const appInitializerFactory = (
  explorer: DataExplorerService
): (() => Observable<DataExplorerConfiguration>) => {
  return () => explorer.initialise();
};

/**
 * Factory function for getting the loaded {@link DataExplorerConfiguration}. This provides a convenient way
 * to inject the {@link DataExplorerConfiguration} via the {@link DATA_EXPLORER_CONFIGURATION} injection token
 * without needing to inject the {@link DataExplorerService} directly.
 *
 * @param explorer The {@link DataExplorerService} to fetch the {@link DataExplorerConfiguration}.
 * @returns The loaded {@link DataExplorerConfiguration} object.
 *
 * This factory function should be used with the {@link DATA_EXPLORER_CONFIGURATION} injection token.
 *
 * This function requires the {@link APP_INITIALIZER} to have been called first and to have performed
 * the {@link DataExplorerConfiguration.initialise()} invocation, otherwise a critical error will be
 * thrown.
 */
const dataExplorerConfigurationFactory = (
  explorer: DataExplorerService
): DataExplorerConfiguration => {
  if (!explorer.config) {
    throw new Error('DataExplorerService.initialse() has not been invoked');
  }

  return explorer.config;
};

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

// Work around to display and validate dates in gb format
export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    MauroModule.forRoot({
      apiEndpoint: environment.apiEndpoint,
      defaultHttpRequestOptions: {
        withCredentials: true,
      },
    }),
    AppRoutingModule,
    ToastrModule.forRoot({
      timeOut: 30000,
      positionClass: 'toast-top-right-custom',
      preventDuplicates: false,
    }),
    PagesModule,
    NgChartsModule,
  ],
  providers: [
    {
      provide: AUTHORIZATION_REDIRECT_URL,
      useValue: '/sign-in',
    },
    {
      provide: OPENID_CONNECT_CONFIG,
      useValue: {
        redirectUrl: getOpenIdAuthorizeUrl(),
      },
    },
    {
      provide: USER_IDLE_CONFIGURATION,
      useValue: {
        idle: 600,
        timeout: 300,
      },
    },
    {
      provide: STATIC_CONTENT_CONFIGURATION,
      useValue: {
        contentLocation: 'assets/content',
      },
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [DataExplorerService],
      multi: true,
    },
    {
      provide: DATA_EXPLORER_CONFIGURATION,
      useFactory: dataExplorerConfigurationFactory,
      deps: [DataExplorerService],
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: DATE_FORMATS,
    },
    {
      provide: LOCALE_ID,
      useValue: 'en-GB',
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
