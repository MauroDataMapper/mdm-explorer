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
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataElementDetail,
  Profile,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { ProfileService } from 'src/app/mauro/profile.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, forkJoin, catchError, EMPTY } from 'rxjs';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from 'src/app/data-explorer/data-explorer.types';
import { DataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';
import {
  DataRequestsService,
  SourceTargetIntersections,
} from 'src/app/data-explorer/data-requests.service';

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
  dataElementSearchResult?: DataElementSearchResult;

  researchProfile?: Profile;
  identifiableData?: string;

  bookmarks: Bookmark[] = [];

  sourceTargetIntersections: SourceTargetIntersections[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataModels: DataModelService,
    private dataRequests: DataRequestsService,
    private bookmarkService: BookmarkService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    @Inject(DATA_EXPLORER_CONFIGURATION) private config: DataExplorerConfiguration
  ) {}

  ngOnInit(): void {
    this.bookmarkService.index().subscribe((result) => {
      this.bookmarks = result;
    });

    this.route.params
      .pipe(
        switchMap((params) => {
          this.dataModelId = params.dataModelId;
          this.dataClassId = params.dataClassId;
          this.dataElementId = params.dataElementId;

          return forkJoin([
            this.loadDataElement(),
            this.loadProfile(),
            this.loadIntersections(this.dataModelId),
          ]);
        })
      )
      .subscribe(([dataElementDetail, profile, sourceTargetIntersections]) => {
        this.dataElement = dataElementDetail;
        this.dataElementSearchResult = {
          id: dataElementDetail.id ?? '',
          dataClassId: dataElementDetail.dataClass ?? '',
          dataModelId: dataElementDetail.model ?? '',
          label: dataElementDetail.label,
          breadcrumbs: dataElementDetail.breadcrumbs,
        };
        this.researchProfile = profile;
        this.sourceTargetIntersections = sourceTargetIntersections;

        // Check for the Identifiable Data value
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
      });
  }

  toggleBookmark(selected: boolean) {
    if (!this.dataElement) {
      return;
    }

    const item: Bookmark = {
      id: this.dataElement.id ?? '',
      dataModelId: this.dataElement.model ?? '',
      dataClassId: this.dataElement.dataClass ?? '',
      label: this.dataElement.label,
    };

    if (selected) {
      this.bookmarkService.add(item).subscribe(() => {
        this.toastr.success(`${item.label} added to bookmarks`);
      });
    } else {
      this.bookmarkService.remove(item).subscribe(() => {
        this.toastr.success(`${item.label} removed from bookmarks`);
      });
    }
  }

  /**
   * Is this.item bookmarked?
   *
   * @returns boolean true if this.item is stored in this.bookmarks
   */
  isBookmarked(): boolean {
    let found: boolean;
    found = false;

    this.bookmarks.forEach((bookmark: Bookmark) => {
      if (this.dataElement && this.dataElement.id === bookmark.id) found = true;
    });

    return found;
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
        })
      );
  }

  private loadIntersections(dataModelId: Uuid) {
    return this.dataRequests.getRequestsIntersections(dataModelId).pipe(
      catchError((error) => {
        console.log(error);
        this.toastr.error('Unable to retrieve requests.');
        return EMPTY;
      })
    );
  }
}
