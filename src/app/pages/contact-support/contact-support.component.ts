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
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, EMPTY, filter, switchMap, tap } from 'rxjs';
import { ContactFormState } from 'src/app/catalogue/contact-form/contact-form.component';
import {
  FeedbackDialogComponent,
  FeedbackDialogResponse,
} from 'src/app/catalogue/feedback-dialog/feedback-dialog.component';
import { PluginResearchContactPayload } from 'src/app/mdm-rest-client/plugins/plugin-research.resource';
import { ResearchPluginService } from 'src/app/mdm-rest-client/research-plugin.service';

@Component({
  selector: 'mdm-contact-support',
  templateUrl: './contact-support.component.html',
  styleUrls: ['./contact-support.component.scss'],
})
export class ContactSupportComponent {
  state: ContactFormState = 'idle';
  contactData?: PluginResearchContactPayload;

  constructor(private research: ResearchPluginService, private dialog: MatDialog) {}

  reset() {
    this.contactData = {
      subject: '',
      message: '',
    };

    this.state = 'idle';
  }

  contact(data: PluginResearchContactPayload) {
    this.state = 'sending';
    const onStateChange = (success: boolean) => {
      this.state = success ? 'sent' : 'error-sending';
    };

    this.sendContactPayload(data, onStateChange).subscribe(() => {});
  }

  sendFeedback() {
    this.dialog
      .open<FeedbackDialogComponent, any, FeedbackDialogResponse>(FeedbackDialogComponent)
      .afterClosed()
      .pipe(
        filter((response) => !!response),
        switchMap((response) => {
          const data: PluginResearchContactPayload = {
            subject: 'Mauro Data Explorer feedback',
            message: response!.message, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          };

          this.state = 'sending';

          const onStateChange = (success: boolean) => {
            this.state = success ? 'sent' : 'error-sending';
          };

          // Send feedback to the same endpoint as contact form submission, minus contact details.
          // This may change in the future, but will do for now
          return this.sendContactPayload(data, onStateChange);
        })
      )
      .subscribe(() => {});
  }

  private sendContactPayload(
    data: PluginResearchContactPayload,
    onStateChange: (success: boolean) => void
  ) {
    return this.research.contact(data).pipe(
      catchError(() => {
        onStateChange(false);
        return EMPTY;
      }),
      tap(() => onStateChange(true))
    );
  }
}
