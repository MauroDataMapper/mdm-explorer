import { Component, OnInit } from '@angular/core';
import { DataModelDetail } from '@maurodatamapper/mdm-resources';
import { CatalogueSearchPayload } from 'src/app/catalogue/catalogue.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  searchTerms: string = '';
  currentUserRequests: DataModelDetail[] = [];

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService,
    private userRequests: UserRequestsService
  ) {}

  ngOnInit(): void {
    if (!this.security.isSignedIn()) {
      this.stateRouter.transitionTo('app.container.home');
      return;
    }

    // if user is signed in, get their current list of user-requests
  }

  search(): void {
    const payload = { searchTerms: this.searchTerms } as CatalogueSearchPayload;
    this.stateRouter.transitionTo('app.container.search-results', payload);
  }
}