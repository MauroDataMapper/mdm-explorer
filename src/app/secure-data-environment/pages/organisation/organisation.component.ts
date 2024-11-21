import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  ListColumn,
  MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  RequestFilterMode,
} from '@maurodatamapper/sde-resources';

export interface Organisation {
  name: string;
  description: string;
}

export interface OrganisationMember {
  preferredName: string;
  email: string;
  role: string;
}

@Component({
  selector: 'mdm-organisation',
  templateUrl: './organisation.component.html',
  styleUrls: ['./organisation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganisationComponent {
  organisation: Organisation = {
    name: 'Test Organisation',
    description: 'Test description',
  };
  requestsNeedingApprovalListConfig: RequestFilterMode = RequestFilterMode.CanAuthorise;

  organisationMembers: OrganisationMember[] = [
    {
      preferredName: 'Organisation Approver',
      email: 'approver@gmail.com',
      role: 'Approver',
    },
    {
      preferredName: 'Organisation Contact',
      email: 'contact@gmail.com',
      role: 'Contact',
    },
  ];

  displayColumns: ListColumn[] = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;
}
