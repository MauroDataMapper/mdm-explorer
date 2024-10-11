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
Feature: Sign out
  As an authenticated user
  I want to sign out of Secure Data Environment User Portal

  Background:
    Given I am signed in
    And I go to the dashboard page

  Scenario: Sign out of the current session
    When I click my user icon
    And I click the "Sign out" button
    Then I am no longer signed in
    And I go to the home page
    And The "Sign in" button is shown
