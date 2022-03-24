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
import { DataModel } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { CatalogueSearchPayload } from 'src/app/catalogue/catalogue.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  searchTerms = '';
  currentUserRequests: DataModel[] = [];

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService,
    private userRequests: UserRequestsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user === null) {
      this.stateRouter.transitionTo('app.container.home');
      return;
    }

    this.loadRequests(user.userName);
  }

  loadRequests(username: string) {
    this.userRequests
      .list(username)
      .pipe(
        catchError((error) => {
          this.toastr.error('Unable to retrieve your current requests from the server.');
          return throwError(() => error);
        })
      )
      .subscribe((dataModels: DataModel[]) => {
        this.currentUserRequests = [...dataModels];
      });
  }

  search(): void {
    const payload = { searchTerms: this.searchTerms } as CatalogueSearchPayload;
    this.stateRouter.transitionTo('app.container.search-listing', payload);
  }
}
