import { Component, OnInit } from '@angular/core';
import { Organisation, UserOrganisationDto, Uuid } from '@maurodatamapper/sde-resources';
import { SdeOrganisationService } from '../../services/sde-organisation.service';
import { of, switchMap, EMPTY } from 'rxjs';

@Component({
  selector: 'mdm-organisations',
  templateUrl: './organisations.component.html',
  styleUrls: ['./organisations.component.scss'],
})
export class OrganisationsComponent implements OnInit {
  selectedOrganisation: Organisation | undefined;
  myOrganisations: UserOrganisationDto[] = [];

  constructor(private sdeOrganisationService: SdeOrganisationService) {}

  ngOnInit(): void {
    this.sdeOrganisationService
      .getUsersOrganisations()
      .pipe(
        switchMap((orgs: UserOrganisationDto[]) => {
          if (orgs.length === 0) {
            return EMPTY;
          }

          this.myOrganisations = orgs;
          const initialOrgValue = this.myOrganisations[0] as UserOrganisationDto;

          return this.sdeOrganisationService.get(initialOrgValue.organisationId);
        })
      )
      .subscribe((org: Organisation) => {
        this.selectedOrganisation = org;
      });
  }

  onOrganisationSelectEvent(value: UserOrganisationDto) {
    const selectedOrgId = value.organisationId as Uuid;
    this.sdeOrganisationService
      .get(selectedOrgId)
      .subscribe((org: Organisation | undefined) => {
        this.selectedOrganisation = org;
      });
  }

  // Currently, the organisation endpoint doesn't actually return the Id.
  //   private setSelectedOrganisation(id: Uuid, org: Organisation): Organisation {
  //     return {
  //       id,
  //       ...org,
  //     } as Organisation;
  //   }
}
