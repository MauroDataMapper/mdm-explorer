/*
Copyright 2022 University of Oxford
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
import { Component, Input } from '@angular/core';
import { UserDetails } from 'src/app/security/user-details.service';
import { ArrowDirection } from '../directives/arrow.directive';

/**
 * Define the details for a link in the layout and navigation components.
 */
export interface HeaderLink {
  /**
   * The display label to apply to the link.
   */
  label: string;

  /**
   * Provide the route link to transition to.
   */
  routerLink: string;

  /**
   * State the target to use on the anchor tag.
   */
  target?: '_blank' | '_self';

  /**
   * States if this link should only be visible if a user is signed in first.
   */
  onlySignedIn?: boolean;

  arrow?: ArrowDirection;

  /**
   * Provide the name of this header links dropdown menu.
   */
  menuName?: string;
}

export interface HeaderImageLink extends HeaderLink {
  imageSrc: string;
}

/**
 * Renders a page header with navigation.
 */
@Component({
  selector: 'mdm-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  /**
   * Provide the link to use for the header logo. This includes the asset source and the
   * URL to navigate to.
   */
  @Input() logoLink?: HeaderImageLink;

  /*
   * Provide the asset source to the Mauro logo.
   */
  @Input() mauroLogoSrc?: string;

  /**
   * Provide the collection of navigation links to include in the header.
   */
  @Input() links: HeaderLink[] = [];

  /**
   * Provide the collection of navigation links to include in the header.
   */
  @Input() rightLinks: HeaderImageLink[] = [];

  /**
   * Provide the link to redirect to sign-in.
   */
  @Input() accountLink: HeaderLink = {
    label: 'Missing Label',
    routerLink: 'app.container.home',
  };

  @Input() numberOfRequests = 0;

  /**
   * Provide the link to redirect to sign-in.
   */
  @Input() signInLink?: HeaderLink;

  /**
   * If a user is signed in, provide the profile image of this user if it exists.
   */
  @Input() signedInUserProfileImageSrc?: string;

  /**
   * If a user is signed in, provide the details of this user. Otherwise leave this undefined.
   */
  @Input() signedInUser?: UserDetails | null;

  get includeSignIn() {
    return !!this.signInLink;
  }

  get isSignedIn() {
    return !!this.signedInUser;
  }
}
