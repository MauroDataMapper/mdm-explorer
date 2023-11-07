import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ListColumn,
  Organisation,
  UserOrganisationDto,
} from '@maurodatamapper/sde-resources';

@Component({
  selector: 'mdm-organisation-list',
  templateUrl: './organisation-list.component.html',
  styleUrls: ['./organisation-list.component.scss'],
})
export class OrganisationListComponent implements OnInit {
  @Input() myOrganisations: UserOrganisationDto[] = [];
  @Output() rowClickEvent = new EventEmitter<UserOrganisationDto>();
  @Output() listLoadedEvent = new EventEmitter<Organisation>();

  displayColumns: ListColumn[] = [
    { displayHeader: 'Name', fieldName: 'organisationName' },
    { displayHeader: 'Role', fieldName: 'role' },
    { displayHeader: 'End date', fieldName: 'endDate' },
  ];

  clickableColumns: string[] = [];

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  onRowClickEvent(value: UserOrganisationDto) {
    console.log('value');
    this.rowClickEvent.emit(value);
  }
}
