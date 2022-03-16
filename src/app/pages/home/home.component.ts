import { Component, OnInit } from '@angular/core';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService
  ) {}

  ngOnInit(): void {
    // if user is signed in, take them to their dashboard.
    if (this.security.isSignedIn()) {
      this.stateRouter.transitionTo('app.container.dashboard');
      return;
    }
  }
}
