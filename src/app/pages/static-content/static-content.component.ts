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
import { SafeHtml } from '@angular/platform-browser';
import { UIRouterGlobals } from '@uirouter/angular';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY } from 'rxjs';
import { StaticContentService } from 'src/app/core/static-content.service';

/**
 * Renders static content to the entirety of the space provided.
 *
 * Requires a `path` query parameter to be passed through the route.
 */
@Component({
  selector: 'mdm-static-content',
  templateUrl: './static-content.component.html',
  styleUrls: ['./static-content.component.scss'],
})
export class StaticContentComponent implements OnInit {
  content: SafeHtml = '';

  constructor(
    private routerGlobals: UIRouterGlobals,
    private staticContent: StaticContentService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const path: string = this.routerGlobals.params.path;
    if (!path) {
      return;
    }

    this.staticContent
      .getContent(path)
      .pipe(
        catchError(() => {
          this.toastr.error(`Unable to load content from '${path}'.`);
          return EMPTY;
        })
      )
      .subscribe((content) => (this.content = content));
  }
}
