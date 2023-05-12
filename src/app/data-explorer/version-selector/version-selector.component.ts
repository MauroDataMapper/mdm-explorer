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

import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { SimpleModelVersionTree } from '@maurodatamapper/mdm-resources';
import { DataModelService } from 'src/app/mauro/data-model.service';

export interface VersionOption {
  id: string;
  displayName: string;
}

@Component({
  selector: 'mdm-version-selector',
  templateUrl: './version-selector.component.html',
  styleUrls: ['./version-selector.component.scss'],
})
export class VersionSelectorComponent implements OnInit, OnChanges {
  @Input()
  modelId!: string;
  @Input() showVersionOnly = false;
  @Output() valueChange = new EventEmitter<VersionOption>();

  constructor(private dataModels: DataModelService, private router: Router) {}

  ngOnInit(): void {
    this.setDropdownOptions();
  }

  /**
   * When a new version is created for a data specification
   * we will redirect the user to the new version details
   * page using state router. But the component is not refreshing
   * (onInit) is not called when this happens and the dropdown will not
   * show the latest version number. The ideal way is to add an event on
   * the router, but no events are captured when hooking in the constructor
   * so I have not found a better way of doing this. To avoid unnecessary
   * backend calls we cache the last checked modelId to not call again for
   * the same data specification if there is no need.
   */
  ngOnChanges() {
    if (this.modelId !== this.lastCheckedModelId) {
      this.setDropdownOptions();
    }
  }

  select(change: MatSelectChange) {
    this.valueChange.emit(change.value as VersionOption);
  }

  currentVersion?: VersionOption;
  versionOptions: VersionOption[] = [];

  private lastCheckedModelId = '';

  private setDropdownOptions() {
    this.dataModels
      .simpleModelVersionTree(this.modelId, false)
      .subscribe((versionTree) => {
        this.lastCheckedModelId = this.modelId;
        this.handleVersionTree(versionTree);
      });
  }

  private handleVersionTree(versionTree: SimpleModelVersionTree[]) {
    if (!this.modelId) {
      return;
    }
    if (!versionTree || versionTree.length < 1) {
      this.currentVersion = { id: this.modelId, displayName: '1.0.0' };
    }

    this.versionOptions = [];

    versionTree.forEach((versionNode) => {
      const option: VersionOption = {
        id: versionNode.id,
        displayName:
          versionNode.branch === 'main'
            ? this.getExplorerCustomDisplayName(versionNode.displayName)
            : versionNode.displayName,
      };

      this.versionOptions.push(option);
      if (versionNode.id === this.modelId) {
        this.currentVersion = option;
      }
    });
  }

  private getExplorerCustomDisplayName(name: string): string {
    // remove undesired text
    let displayName = name.replace('main', '');

    // Increase version
    const parts = displayName.trim().split('.');

    const majorVersion = parts[0].substring(2);
    let nextMajorVersion: number = +majorVersion;
    nextMajorVersion++;

    parts[0] = parts[0].replace(majorVersion, `${nextMajorVersion}`);

    displayName = parts.join('.').replace('(', '').replace(')', '');

    return displayName;
  }
}
