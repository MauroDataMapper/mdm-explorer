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
import { Component, OnInit } from '@angular/core';
import { PublicOpenIdConnectProvider } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { FeaturesService } from 'src/app/core/features.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import { LoginError, SignInErrorType } from 'src/app/security/security.types';
import { SignInClickEvent } from 'src/app/security/sign-in-form/sign-in-form.component';

@Component({
  selector: 'mdm-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  authenticating = false;
  signInError?: SignInErrorType;
  openIdConnectProviders?: PublicOpenIdConnectProvider[];

  constructor(
    private security: SecurityService,
    private broadcast: BroadcastService,
    private features: FeaturesService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadOpenIdConnectProviders();
  }

  signIn(credentials: SignInClickEvent) {
    this.authenticating = true;

    this.security.signIn({
      username: credentials.userName,
      password: credentials.password
    })
      .pipe(
        catchError((error: LoginError) => {
          this.signInError = error.type;
          return EMPTY;
        }),
        finalize(() => {
          this.authenticating = false;
        })
      )
      .subscribe(user => {
        this.broadcast.userSignedIn(user);
        this.stateRouter.transitionTo(
          'app.container.home',
          { },
          {
            reload: true,
            inherit: false
          });
      });
  }

  authenticateWithOpenIdConnect(provider: PublicOpenIdConnectProvider) {
    if (!provider.authorizationEndpoint) {
      this.toastr.error(`Unable to authenticate with ${provider.label} because of a missing endpoint. Please contact your administrator for further support.`);
      return;
    }

    // Track which provider was used, will be needed once redirected back to Mauro
    localStorage.setItem('openIdConnectProviderId', provider.id);
    const redirectUrl = this.security.getOpenIdConnectAuthorizationUrl(provider);
    window.open(redirectUrl.toString(), '_self');
  }

  forgotPassword() {
    this.stateRouter.transitionTo('app.container.forgot-password');
  }

  private loadOpenIdConnectProviders() {
    if (!this.features.useOpenIdConnect) {
      return;
    }

    this.security.getOpenIdConnectProviders().subscribe(providers => this.openIdConnectProviders = providers);
  }
}
