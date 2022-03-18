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
import { Injectable } from '@angular/core';

/**
 * Represents the common details of a signed in user.
 */
export interface UserDetails {
  id: string;
  token?: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role?: string;
  needsToResetPassword?: boolean;
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
  constructor() {}

  /**
   * Gets the current user in use, or null if there is no current user.
   */
  get(): UserDetails | null {
    const userName = localStorage.getItem('userName');
    if (!userName || userName.length === 0) {
      return null;
    }

    return {
      id: localStorage.getItem('userId') ?? '',
      token: localStorage.getItem('token') ?? undefined,
      firstName: localStorage.getItem('firstName') ?? '',
      lastName: localStorage.getItem('lastName') ?? '',
      email: localStorage.getItem('email') ?? '',
      userName,
      role: localStorage.getItem('role') ?? undefined,
      needsToResetPassword: Boolean(localStorage.getItem('needsToResetPassword')),
    };
  }

  /**
   * Sets the current user in use.
   */
  set(user: UserDetails) {
    // Keep username for 100 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token ?? '');
    localStorage.setItem('userName', user.email);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem(
      'email',
      JSON.stringify({ email: user.userName, expiry: expiryDate })
    );
    localStorage.setItem('role', user.role ?? '');
    localStorage.setItem(
      'needsToResetPassword',
      (user.needsToResetPassword ?? false).toString()
    );
  }

  /**
   * Clears the current user in use.
   */
  clear() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem('needsToResetPassword');
  }
}
