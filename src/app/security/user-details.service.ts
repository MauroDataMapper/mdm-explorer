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
import { Injectable } from '@angular/core';
import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { ResearchUser, SdeUserDetails } from '@maurodatamapper/sde-resources';

/**
 * Represents the common details of a signed in user.
 */
export interface UserDetails {
  id: string;
  token?: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  needsToResetPassword?: boolean;
  dataSpecificationFolder?: FolderDetail;
  sdeAuthToken?: string;
}

/**
 * Manages local details about the current Mauro user who is logged in.
 *
 * @see {@link SecurityService}
 */
@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  constructor() { }

  /**
   * Gets the current user in use, or null if there is no current user.
   */
  get(): UserDetails | null {
    const userEmail = localStorage.getItem('email');
    if (!userEmail || userEmail.length === 0) {
      return null;
    }
    const dataSpecificationFolder = localStorage.getItem('dataSpecificationFolder');

    return {
      id: localStorage.getItem('userId') ?? '',
      token: localStorage.getItem('token') ?? undefined,
      firstName: localStorage.getItem('firstName') ?? '',
      lastName: localStorage.getItem('lastName') ?? '',
      email: localStorage.getItem('email') ?? '',
      role: localStorage.getItem('role') ?? undefined,
      needsToResetPassword: Boolean(localStorage.getItem('needsToResetPassword')),
      dataSpecificationFolder: dataSpecificationFolder
        ? (JSON.parse(dataSpecificationFolder) as FolderDetail)
        : undefined,
      sdeAuthToken: localStorage.getItem('sdeAuthToken') ?? undefined,
    };
  }

  /**
   * Sets the current user in use and adds an additional property, dataSpecificationFolder.
   */
  set(user: UserDetails) {
    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token ?? '');
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem('email', user.email);
    localStorage.setItem('role', user.role ?? '');
    localStorage.setItem(
      'needsToResetPassword',
      (user.needsToResetPassword ?? false).toString()
    );
    localStorage.setItem(
      'dataSpecificationFolder',
      JSON.stringify(user.dataSpecificationFolder)
    );
    localStorage.setItem('sdeAuthToken', user.sdeAuthToken ?? '');
  }

  /**
   * Clears the current user in use.
   */
  clear() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('needsToResetPassword');
    localStorage.removeItem('dataSpecificationFolder');
    localStorage.removeItem('sdeAuthToken');
  }

  getSdeResearchUser(): SdeUserDetails | null {
    if (!this.hasSdeResearchUser()) {
      return null;
    }

    return {
      id: localStorage.getItem('sdeUserId') ?? '',
      email: localStorage.getItem('sdeEmail') ?? '',
      firstName: localStorage.getItem('firstName') ?? '',
      lastName: localStorage.getItem('lastName') ?? '',
      role: localStorage.getItem('role') ?? '',
    } as SdeUserDetails;
  }

  setSdeResearchUser(user: ResearchUser) {
    localStorage.setItem('sdeUserId', user.id);
    localStorage.setItem('sdeEmail', user.email);
    localStorage.setItem('sdePreferredName', user.preferredName ?? '');
  }

  hasSdeResearchUser(): boolean {
    return !!localStorage.getItem('sdeUserId');
  }

  clearSdeResearchUser() {
    localStorage.removeItem('sdeUserId');
    localStorage.removeItem('sdeEmail');
    localStorage.removeItem('sdePreferredName');
  }
}
