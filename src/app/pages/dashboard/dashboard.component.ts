import { Component, OnInit } from '@angular/core';
import { DataModel } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
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
  currentUserRequests: DataModel[] = [];

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService,
    private userRequests: UserRequestsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user === null) {
      this.stateRouter.transitionTo('app.container.home');
      return;
    }

    this.loadRequests(user.userName);
  }

  loadRequests(username: string) {
    this.userRequests
      .list(username)
      .pipe(
        catchError((error) => {
          this.toastr.error('Unable to retrieve your current requests from the server.');
          return throwError(() => error);
        })
      )
      .subscribe((dataModels: DataModel[]) => {
        this.currentUserRequests = [...dataModels];
      });
  }

  search(): void {
    const payload = { searchTerms: this.searchTerms } as CatalogueSearchPayload;
    this.stateRouter.transitionTo('app.container.search-listing', payload);
  }
}
