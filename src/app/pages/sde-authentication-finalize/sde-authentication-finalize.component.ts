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
import { Component } from '@angular/core';
import { ResearchUser, SdeUserService, User } from '@maurodatamapper/sde-resources';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserDetailsService } from 'src/app/security/user-details.service';

@Component({
  selector: 'mdm-sde-authentication-finalize',
  templateUrl: './sde-authentication-finalize.component.html',
  styleUrls: ['./sde-authentication-finalize.component.scss'],
})
export class SdeAuthenticationFinalizeComponent {
  constructor(
    private broadcast: BroadcastService,
    private userDetails: UserDetailsService,
    private sdeUserService: SdeUserService,
    private stateRouter: StateRouterService
  ) {}

  signInSuccess(user: User | ResearchUser) {
    this.userDetails.setSdeResearchUser(user as ResearchUser);
    // sets the user current org membership status
    this.sdeUserService.isSdeUserAMemberOfAnOrganisation(user.id).subscribe((isMember) => {
      this.userDetails.sdeSetUserOrganisationMembership(isMember);
      this.broadcast.sdeUserOrganisationStatusUpdated(isMember);
      this.stateRouter.navigateToKnownPath('/dashboard');
    });
  }

  signOut() {
    this.userDetails.clearSdeResearchUser();
    this.stateRouter.navigateToKnownPath('/home');
  }
}
