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
import { NgModule } from '@angular/core';
import { SignInFormComponent } from './sign-in-form/sign-in-form.component';
import { SharedModule } from '../shared/shared.module';
import { OpenIdConnectAuthorizeComponent } from './open-id-connect-authorize/open-id-connect-authorize.component';
import { ForgotPasswordFormComponent } from './forgot-password-form/forgot-password-form.component';
import { CatalogueUserBasicFormComponent } from './catalogue-user-basic-form/catalogue-user-basic-form.component';
import { CatalogueUserContactFormComponent } from './catalogue-user-contact-form/catalogue-user-contact-form.component';
import { CoreModule } from '../core/core.module';
import { ChangePasswordFormComponent } from './change-password-form/change-password-form.component';

@NgModule({
  declarations: [
    SignInFormComponent,
    OpenIdConnectAuthorizeComponent,
    ForgotPasswordFormComponent,
    CatalogueUserBasicFormComponent,
    CatalogueUserContactFormComponent,
    ChangePasswordFormComponent,
  ],
  imports: [CoreModule, SharedModule],
  exports: [
    SignInFormComponent,
    OpenIdConnectAuthorizeComponent,
    ForgotPasswordFormComponent,
    CatalogueUserBasicFormComponent,
    CatalogueUserContactFormComponent,
    ChangePasswordFormComponent,
  ],
})
export class SecurityModule {}
