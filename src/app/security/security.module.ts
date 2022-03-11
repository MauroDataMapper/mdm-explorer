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
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignInFormComponent } from './sign-in-form/sign-in-form.component';
import { SharedModule } from '../shared/shared.module';
import { OpenIdConnectAuthorizeComponent } from './open-id-connect-authorize/open-id-connect-authorize.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { UIRouterModule } from '@uirouter/angular';
import { CatalogueUserFormComponent } from './catalogue-user-form/catalogue-user-form.component';
import { CatalogueSearchFormComponent } from './catalogue-search-form/catalogue-search-form.component';

@NgModule({
  declarations: [
    SignInFormComponent,
    OpenIdConnectAuthorizeComponent,
    ForgotPasswordFormComponent,
    CatalogueUserFormComponent,
    CatalogueSearchFormComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SharedModule,
    UIRouterModule,
  ],
  exports: [
    SignInFormComponent,
    OpenIdConnectAuthorizeComponent,
    ForgotPasswordFormComponent,
    CatalogueUserFormComponent,
    CatalogueSearchFormComponent,
  ],
})
export class SecurityModule {}
