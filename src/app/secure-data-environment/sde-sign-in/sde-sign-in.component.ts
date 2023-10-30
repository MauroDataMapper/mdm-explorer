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
