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
import { Component, Input, OnInit } from '@angular/core';
import { DataModel, DataModelSubsetPayload } from '@maurodatamapper/mdm-resources';
import { forkJoin, switchMap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DataElementDetail, Uuid } from '@maurodatamapper/mdm-resources';
import { SecurityService } from 'src/app/security/security.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import { DataModelService } from 'src/app/mauro/data-model.service';

@Component({
  selector: 'mdm-data-element-in-request',
  templateUrl: './data-element-in-request.component.html',
  styleUrls: ['./data-element-in-request.component.scss'],
})
export class DataElementInRequestComponent implements OnInit {
  @Input() dataElement?: DataElementDetail;

  dataAccessRequests: DataModel[] = [];

  ready = false;

  // A list of requests to which this data element belongs
  inRequests: Uuid[] = [];

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService,
    private dataModels: DataModelService,
    private dataRequests: DataRequestsService,
    private endpoints: MdmEndpointsService
  ) {}

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user === null) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    const checkedTargetDataModelIds: Uuid[] = [];

    /**
     * Get all the data access requests.
     * For each request, use the intersects method to check whether this data element is in the request.
     * This is slow and it would benefit from an endpoint which returns a list of data models containing this
     * data element.
     */
    this.dataRequests
      .list(user.email)
      .pipe(
        switchMap((dataModels: DataModel[]) => {
          this.dataAccessRequests = [...dataModels];

          const checks: any[] = [];

          this.dataAccessRequests.forEach((item: DataModel) => {
            if (this.dataElement && this.dataElement.model && item.id) {
              checks.push(this.checkIntersection(this.dataElement.model, item.id));
              checkedTargetDataModelIds.push(item.id);
            }
          });

          return forkJoin(checks);
        })
      )
      .subscribe((intersectionsForEachTargetDataModel) => {
        for (let i = 0; i < checkedTargetDataModelIds.length; i++) {
          const mySourceDataModelId = checkedTargetDataModelIds[i];
          const intersections = intersectionsForEachTargetDataModel[i];

          if (intersections.intersects.indexOf(this.dataElement?.id) > -1) {
            this.inRequests.push(mySourceDataModelId);
          }
          this.ready = true;
        }
      });
  }

  checkIntersection(sourceDataModelId: Uuid, targetDataModelId: Uuid) {
    return this.dataModels.getIntersection(sourceDataModelId, targetDataModelId).pipe();
  }

  optionChanged(event: MatOptionSelectionChange) {
    if (
      this.dataElement &&
      this.dataElement.id &&
      this.dataElement.model &&
      event.isUserInput
    ) {
      const targetDataModelId = event.source.value;
      const datamodelSubsetPayload: DataModelSubsetPayload = {
        additions: [],
        deletions: [],
      };
      if (event.source.selected) {
        // Do a subset add for this data element in the request
        datamodelSubsetPayload.additions = [this.dataElement.id];
      } else {
        // Do a subset remove for this data element in the request
        datamodelSubsetPayload.deletions = [this.dataElement.id];
      }

      this.endpoints.dataModel
        .copySubset(this.dataElement.model, targetDataModelId, datamodelSubsetPayload) // eslint-disable-line @typescript-eslint/no-unsafe-argument
        .subscribe(() => {});
    }
  }
}
