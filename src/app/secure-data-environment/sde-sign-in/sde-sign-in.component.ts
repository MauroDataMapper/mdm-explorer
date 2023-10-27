import { Component, OnInit } from '@angular/core';
import { SdeOpenIdConnectProvider } from '../resources/authentication.resources';
import { SdeEndpointsService } from '../sde-endpoints.service';

@Component({
  selector: 'mdm-sde-sign-in',
  templateUrl: './sde-sign-in.component.html',
  styleUrls: ['./sde-sign-in.component.scss'],
})
export class SdeSignInComponent implements OnInit {
  providers?: SdeOpenIdConnectProvider[];

  constructor(private sdeEndpoints: SdeEndpointsService) {}

  ngOnInit(): void {
    this.sdeEndpoints.authentication
      .listOpenIdConnectProviders()
      .subscribe((providers) => (this.providers = providers));
  }

  authenticateWithOpenIdConnect(provider: SdeOpenIdConnectProvider) {
    const redirectUrl =
      this.sdeEndpoints.authentication.getOpenIdConnectAuthorizationUrl(provider);
    window.open(redirectUrl.toString(), '_self');
  }
}
