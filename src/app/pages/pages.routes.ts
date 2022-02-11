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
import { Ng2StateDeclaration } from '@uirouter/angular';
import { AboutComponent } from './about/about.component';
import { AuthorizedOnlyComponent } from './authorized-only/authorized-only.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';

export const states: Ng2StateDeclaration[] = [
  {
    name: 'app.container.home',
    url: '/home',
    component: HomeComponent,
    data: {
      allowAnonymous: true
    }
  },
  {
    name: 'app.container.about',
    url: '/about',
    component: AboutComponent,
    data: {
      allowAnonymous: true
    }
  },
  {
    name: 'app.container.signin',
    url: '/sign-in',
    component: SignInComponent,
    data: {
      allowAnonymous: true
    }
  },
  {
    name: 'app.container.forgot-password',
    url: '/forgot-password',
    component: ForgotPasswordComponent,
    data: {
      allowAnonymous: true
    }
  },
  {
    name: 'app.container.authorized-only',
    url: '/authorized-only',
    component: AuthorizedOnlyComponent
  },
];
