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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of, Subject, switchMap, takeUntil, throwError } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  AddToDataSpecificationEvent,
  BookMarkCheckedEvent as BookmarkCheckedEvent,
  DataSpecification,
  RemoveBookmarkEvent,
  DataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataSpecificationSourceTargetIntersections,
  DataSpecificationService,
} from 'src/app/data-explorer/data-specification.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss'],
})
export class MyBookmarksComponent implements OnInit, OnDestroy {
  userBookmarks: DataElementSearchResult[] = [];
  selectedElements: DataElementSearchResult[] = [];
  openDataSpecifications: DataSpecification[] = [];
  sourceTargetIntersections: DataSpecificationSourceTargetIntersections;
  isReady = false;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private bookmarks: BookmarkService,
    private security: SecurityService,
    private dataSpecification: DataSpecificationService,
    private explorer: DataExplorerService,
    private toastr: ToastrService,
    private broadcast: BroadcastService
  ) {
    this.sourceTargetIntersections = {
      dataSpecifications: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user) {
      this.dataSpecification.list().subscribe((dataSpecifications: DataSpecification[]) => {
        this.openDataSpecifications = [
          ...dataSpecifications.filter((dataSpecification) => dataSpecification.status === 'draft'),
        ];
      });
    }

    this.loadBookmarks();
    this.subscribeBookmarksRefreshed();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onChecked(event: BookmarkCheckedEvent) {
    const toUpdate = this.userBookmarks.find((bm) => bm.id === event.item.id);
    if (toUpdate) toUpdate.isSelected = event.checked;

    this.updateSelectedElements();
  }

  onAddToDataSpecification(event: AddToDataSpecificationEvent) {
    alert(
      `Add bookmark: ${event.item} to data specification with Id: ${event.dataSpecificationId}`
    );
  }

  onRemove(event: RemoveBookmarkEvent): void {
    this.bookmarks.remove([event.item]).subscribe(() => {
      this.toastr.success(`${event.item.label} removed from bookmarks`);
    });

    this.userBookmarks = this.userBookmarks.filter((bookmark) => bookmark.id !== event.item.id);
  }

  onSelectAll(event: MatCheckboxChange) {
    this.userBookmarks = this.userBookmarks.map((bookmark) => {
      return { ...bookmark, isSelected: event.checked };
    });

    this.updateSelectedElements();
  }

  private updateSelectedElements() {
    // Work out which elements are selected. Store as a property to data bind to mdm-data-element-multi-select
    // and improve performance
    this.selectedElements = this.userBookmarks
      .filter((bookmark) => bookmark.isSelected)
      .map((bookmark) => {
        return {
          ...bookmark,
          isBookmarked: true,
        };
      });
  }

  /**
   * When a data specification is added, reload all intersections (which ensures we pick up intersections with the
   * new data specification) and tell all data-element-in-data-specification components about the new intersections.
   */

  private subscribeDataSpecificationChanges() {
    this.broadcast
      .on('data-specification-added')
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.loadIntersections(this.userBookmarks))
      )
      .subscribe((intersections) => {
        this.sourceTargetIntersections = intersections;
        this.broadcast.dispatch('data-intersections-refreshed', intersections);
      });
  }

  private loadBookmarks() {
    this.bookmarks
      .index()
      .pipe(
        switchMap((bookmarks) => {
          const selectableBookmarks: DataElementSearchResult[] = [];
          bookmarks.forEach((bookmark) => {
            selectableBookmarks.push({ ...bookmark, isSelected: false });
          });

          return of(selectableBookmarks);
        }),
        switchMap((bookmarks: DataElementSearchResult[]) => {
          return forkJoin([this.loadIntersections(bookmarks), of(bookmarks)]);
        })
      )
      .subscribe(([intersections, bookmarks]) => {
        this.sourceTargetIntersections = intersections;
        this.subscribeDataSpecificationChanges();
        this.isReady = true;
        // userBookmarks must be the last property set as this triggers rendering of the
        // bookmarks list.
        this.userBookmarks = bookmarks;
      });
  }

  private loadIntersections(dataElements: DataElementSearchResult[] | undefined) {
    const dataElementIds: Uuid[] = [];

    if (dataElements) {
      dataElements.forEach((item: DataElementSearchResult) => {
        dataElementIds.push(item.id);
      });
    }

    return this.explorer.getRootDataModel().pipe(
      switchMap((dataModel) => {
        if (!dataModel.id) {
          return throwError(() => new Error('Root Data Model has no id.'));
        }

        return this.dataSpecification.getDataSpecificationIntersections(
          dataModel.id,
          dataElementIds
        );
      })
    );
  }

  /**
   * When bookmarks are refreshed, reload them
   */
  private subscribeBookmarksRefreshed(): void {
    this.broadcast
      .on('data-bookmarks-refreshed')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.loadBookmarks();
      });
  }
}
