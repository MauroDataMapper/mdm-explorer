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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ListColumn,
  Organisation,
  UserOrganisationDTO,
} from '@maurodatamapper/sde-resources';

@Component({
  selector: 'mdm-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.scss'],
})
export class OrganisationListComponent implements OnInit {
  @Input() myOrganisations: UserOrganisationDTO[] = [];
  @Output() rowClickEvent = new EventEmitter<UserOrganisationDTO>();
  @Output() listLoadedEvent = new EventEmitter<Organisation>();

  displayColumns: ListColumn[] = [
    { displayHeader: 'Name', fieldName: 'organisationName' },
    { displayHeader: 'Role', fieldName: 'role' },
    { displayHeader: 'End date', fieldName: 'endDate' },
  ];

  clickableColumns: string[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  onRowClickEvent(value: UserOrganisationDTO) {
    this.rowClickEvent.emit(value);
  }
}
