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
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataElementDetail,
  DataType,
  Modelable,
  Profile,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { ProfileService } from 'src/app/mauro/profile.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, forkJoin, catchError, EMPTY, map } from 'rxjs';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from 'src/app/data-explorer/data-explorer.types';
import { DataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { TerminologyService } from 'src/app/mauro/terminology.service';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.scss'],
})
export class DataElementComponent implements OnInit {
  dataModelId: Uuid = '';
  dataClassId: Uuid = '';
  dataElementId: Uuid = '';
  dataElement?: DataElementDetail;

  // A workaround
  dataElementSearchResult: DataElementSearchResult[] = [];

  researchProfile?: Profile;
  identifiableData?: string;
  dataTypeModel?: Modelable;

  isBookmarked = false;

  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  constructor(
    private route: ActivatedRoute,
    private dataModels: DataModelService,
    private dataRequests: DataRequestsService,
    private bookmarks: BookmarkService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private terminologies: TerminologyService,
    @Inject(DATA_EXPLORER_CONFIGURATION) private config: DataExplorerConfiguration
  ) {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.dataModelId = params.dataModelId;
          this.dataClassId = params.dataClassId;
          this.dataElementId = params.dataElementId;

          return forkJoin([
            this.loadDataElement(),
            this.bookmarks.isBookmarked(this.dataElementId),
            this.loadProfile(),
            this.loadIntersections(),
          ]);
        })
      )
      .subscribe(
        ([dataElementDetail, isBookmarked, profile, sourceTargetIntersections]) => {
          this.dataElement = dataElementDetail;
          this.isBookmarked = isBookmarked;
          this.dataElementSearchResult = [];
          this.dataElementSearchResult.push({
            id: dataElementDetail.id ?? '',
            dataClass: dataElementDetail.dataClass ?? '',
            model: dataElementDetail.model ?? '',
            label: dataElementDetail.label,
            dataType: dataElementDetail.dataType as DataType,
            breadcrumbs: dataElementDetail.breadcrumbs,
            isBookmarked,
            isSelected: false,
          });
          this.researchProfile = profile;
          this.sourceTargetIntersections = sourceTargetIntersections;

          this.setIdentifiableData();
          this.setDataTypeModel();
        }
      );
  }

  toggleBookmark(selected: boolean) {
    if (!this.dataElement) {
      return;
    }

    const item: DataElementSearchResult = {
      ...this.dataElement,
      isBookmarked: selected,
      isSelected: false,
    } as DataElementSearchResult;

    if (selected) {
      this.bookmarks.add(item).subscribe(() => {
        this.toastr.success(`${item.label} added to bookmarks`);
      });
    } else {
      this.bookmarks.remove([item]).subscribe(() => {
        this.toastr.success(`${item.label} removed from bookmarks`);
      });
    }
  }

  private loadDataElement() {
    return this.dataModels
      .getDataElement(this.dataModelId, this.dataClassId, this.dataElementId)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to retrieve the chosen Data Element.');
          return EMPTY;
        })
      );
  }

  private loadProfile() {
    return this.profileService
      .get(
        CatalogueItemDomainType.DataElement,
        this.dataElementId,
        this.config.profileNamespace,
        this.config.profileServiceName
      )
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to retrieve the Data Element Profile.');
          return EMPTY;
        }),
        map((profile) => this.trimProfile(profile))
      );
  }

  private loadIntersections() {
    return this.dataRequests
      .getRequestsIntersections(this.dataModelId, [this.dataElementId])
      .pipe(
        catchError((error) => {
          console.log(error);
          this.toastr.error('Unable to retrieve requests.');
          return EMPTY;
        })
      );
  }

  private setIdentifiableData() {
    if (this.researchProfile && this.researchProfile.sections.length > 0) {
      const identifiableInformation = this.researchProfile.sections.find(
        (section) => section.name === 'Identifiable Information'
      );

      if (identifiableInformation && identifiableInformation.fields.length > 0) {
        const identifiableDataField = identifiableInformation.fields.find(
          (field) => field.fieldName === 'Identifiable Data'
        );
        if (identifiableDataField) {
          this.identifiableData = identifiableDataField.currentValue;
        }
      }
    }
  }

  private setDataTypeModel() {
    const dataType = this.dataElement?.dataType as DataType;
    if (dataType?.domainType !== CatalogueItemDomainType.ModelDataType) {
      return;
    }

    const id: Uuid = dataType.modelResourceId;
    const domainType: CatalogueItemDomainType = dataType.modelResourceDomainType;

    if (
      !(
        domainType === CatalogueItemDomainType.Terminology ||
        domainType === CatalogueItemDomainType.CodeSet
      )
    ) {
      // Only support Terminologies or Code Sets for now...
      return;
    }

    this.terminologies
      .getModel(id, domainType)
      .subscribe((model) => (this.dataTypeModel = model));
  }

  /**
   * Trim a profile to remove fields/sections that are empty.
   *
   * @param profile The profile to trim
   */
  private trimProfile(profile: Profile): Profile {
    return {
      id: profile.id,
      domainType: profile.domainType,
      label: profile.label,
      sections: profile.sections
        .map((section) => {
          return {
            name: section.name,
            description: section.description,
            fields: section.fields.filter(
              (field) => field.currentValue && field.currentValue.length > 0
            ),
          };
        })
        .filter((section) => section.fields.length > 0),
    };
  }
}
