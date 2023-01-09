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
import { ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { AppErrorHandlerService } from './app-error-handler.service';
import { AppErrorDialogComponent } from './app-error-dialog/app-error-dialog.component';
import { OverlayContainer } from '@angular/cdk/overlay';

const angularModules = [CommonModule, FormsModule, ReactiveFormsModule, RouterModule];
const primeNgModules = [CarouselModule];

const materialModules = [
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatRadioModule,
  MatIconModule,
  MatInputModule,
  MatFormFieldModule,
  MatListModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatMenuModule,
  MatTabsModule,
  MatSelectModule,
  MatDialogModule,
  MatTooltipModule,
  MatPasswordStrengthModule,
];

@NgModule({
  declarations: [AppErrorDialogComponent],
  imports: [...angularModules, ...materialModules, ...primeNgModules],
  exports: [...angularModules, ...materialModules, ...primeNgModules],
  providers: [
    {
      provide: ErrorHandler,
      useClass: AppErrorHandlerService,
    },
  ],
})
export class CoreModule {
  themeCssSelector = 'default-theme';

  constructor(overlayContainer: OverlayContainer) {
    // Material theme is wrapped inside a CSS class but the overlay container is not part of Angular
    // Material. Have to manually set the correct theme class to this container too
    overlayContainer.getContainerElement().classList.add(this.themeCssSelector);
    overlayContainer.getContainerElement().classList.add('overlay-container');
  }
}
