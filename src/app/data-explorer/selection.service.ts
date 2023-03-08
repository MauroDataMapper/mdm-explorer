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
import { Injectable } from '@angular/core';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataElementSearchResult } from './data-explorer.types';

@Injectable({
  providedIn: 'root',
})

/**
 * Service to handle a temporary selection of data elements
 */
export class SelectionService {
  list$: Observable<DataElementSearchResult[]>;
  private selected: Map<Uuid, DataElementSearchResult>;

  private listSubject: Subject<DataElementSearchResult[]>;

  private STORAGE_KEY = 'elementSelection';

  constructor() {
    const storedJson = localStorage.getItem(this.STORAGE_KEY);
    if (storedJson == null) {
      this.selected = new Map();
      this.listSubject = new BehaviorSubject<DataElementSearchResult[]>([]);
    } else {
      const storedSelection = JSON.parse(storedJson) as DataElementSearchResult[];
      this.listSubject = new BehaviorSubject<DataElementSearchResult[]>(storedSelection);
      this.selected = new Map(storedSelection.map((e) => [e.id, e]));
    }
    this.list$ = this.listSubject.asObservable();
  }

  /**
   * Add the supplied elements to the selection (or replace any elements present with the same ID)
   *
   * @param elements The elements to add
   */
  public add(elements: DataElementSearchResult[]) {
    elements.forEach((e) => this.selected.set(e.id, e));
    this.storeAndEmit();
  }

  /**
   * Remove the elements matching the supplied IDs where present
   *
   * @param elementIds The element IDs to remove
   */
  public remove(elementIds: Uuid[]) {
    elementIds.forEach((id) => this.selected.delete(id));
    this.storeAndEmit();
  }

  /**
   * Clear the entire selection
   */
  public clearSelection() {
    this.selected.clear();
    this.storeAndEmit();
  }

  /**
   * Returns true if an element with the given id in the selection
   *
   * @param dataElementId The data element id to test for the presence of
   * @returns a boolean indicating whether or not the element is selected by the signed in user
   */
  public isSelected(dataElementId: Uuid): boolean {
    return this.selected.has(dataElementId);
  }

  private storeAndEmit() {
    const selectionArray = Array.from(this.selected.values());

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(selectionArray));

    this.listSubject.next(selectionArray);
  }
}
