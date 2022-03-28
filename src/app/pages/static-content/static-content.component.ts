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
import { ActivatedRoute } from '@angular/router';
import { catchError, combineLatest, EMPTY, map, switchMap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
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
  state: 'loading' | 'ready' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private staticContent: StaticContentService,
    private stateRouter: StateRouterService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.data])
      .pipe(
        map(([params, data]) => {
          const path = params.get('path');
          if (path) {
            return path;
          }

          const staticAssetPath: string = data.staticAssetPath;
          return staticAssetPath;
        }),
        switchMap((path: string) => this.staticContent.getContent(path)),
        catchError(() => {
          this.stateRouter.navigateToNotFound();
          return EMPTY;
        })
      )
      .subscribe((content) => {
        this.content = content;
        this.state = 'ready';
      });
  }
}
