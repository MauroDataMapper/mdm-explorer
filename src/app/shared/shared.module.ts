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
import { AlertComponent } from './alert/alert.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { UIRouterModule } from '@uirouter/angular';
import { SafePipe } from './pipes/safe.pipe';
import { ArrowDirective } from './directives/arrow.directive';
import { BookmarkToggleComponent } from './bookmark-toggle/bookmark-toggle.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    AlertComponent,
    FooterComponent,
    HeaderComponent,
    SafePipe,
    ArrowDirective,
    BookmarkToggleComponent,
  ],
  imports: [CoreModule, UIRouterModule],
  exports: [AlertComponent, FooterComponent, HeaderComponent, BookmarkToggleComponent],
})
export class SharedModule {}
