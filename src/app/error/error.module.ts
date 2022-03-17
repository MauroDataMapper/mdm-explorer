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
import { ErrorComponent } from './error.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NotImplementedComponent } from './not-implemented/not-implemented.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    ErrorComponent,
    NotImplementedComponent,
    NotAuthorizedComponent,
    NotFoundComponent,
    ServerErrorComponent,
  ],
  imports: [CoreModule, NgxJsonViewerModule],
})
export class ErrorModule {}
