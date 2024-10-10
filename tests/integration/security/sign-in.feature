# Copyright 2022-2023 University of Oxford
# and Health and Social Care Information Centre, also known as NHS Digital
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# SPDX-License-Identifier: Apache-2.0
Feature: Sign in
  As a user
  I want to sign in to Secure Data Environment User Portal to access further features

  Background:
    Given There exists a user with the email address "researcher@maurodatamapper.com"
    And I am signed out
    And I go to the home page
    And I click the "Sign in" button

  Scenario Outline: Sign in as a valid user
    When I sign in as "<email>" with "<password>"
    Then I go to the dashboard page

    Examples:
      | email                          | password |
      | admin@maurodatamapper.com      | password |
      | researcher@maurodatamapper.com | password |

  Scenario Outline: Sign in as a user that does not exist
    When I sign in as "<email>" with "<password>"
    Then I am not signed in
    And A message says "Invalid username or password!"

    Examples:
      | email         | password |
      | test@test.com | password |
      | 123@test.com  | hello    |

  Scenario: Sign in with empty form
    When I enter no values for "email" and "password"
    Then The sign in button is disabled
    And The email field says "Email is required"
    And The password field says "Password is required"

  Scenario Outline: Sign in with bad format for email address
    When I sign in as "<email>"
    Then The sign in button is disabled
    And The email field says "Invalid email address"

    Examples:
      | email     |
      | test      |
      | 123       |
      | test@test |

  Scenario Outline: Sign in with a user that does exist with the wrong password
    When I sign in as "<email>" with "<password>"
    Then I am not signed in
    And A message says "Invalid username or password!"

    Examples:
      | email                     | password |
      | admin@maurodatamapper.com | 123      |
