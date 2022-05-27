# Copyright 2022 University of Oxford
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
Feature: Accessing user content
  As an authenticated user
  I want to see restricted, user-only content in the Mauro Data Explorer

  Background:
    Given I am signed in

  Scenario: Seeing all available links in the header
    Given I am on the dashboard page
    Then I can see all page links in the header

  Scenario: Viewing the dashboard page
    When I click on the main header logo
    Then I go to the dashboard page

  Scenario: Viewing the browse page
    When I click on the "Browse" link in the header
    Then I go to the browse page

  Scenario: Viewing the search page
    When I click on the "Search" link in the header
    Then I go to the search page

  Scenario: Viewing the bookmarks page
    When I click on the "Bookmarks" link in the header
    Then I go to the bookmarks page

  Scenario: Viewing the requests page
    When I click on the "My requests" link in the header
    Then I go to the requests page

  Scenario: Viewing the account page
    When I click on the avatar icon in the header
    Then I go to the account page
