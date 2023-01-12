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
Feature: Dashboard
  As an authenticated user
  I want an overview of my account when I start using the explorer

  Background:
    Given I am signed in
    And I go to the dashboard page

  Scenario: Search the catalogue
    When I enter the search term "episode"
    Then I go to the search listings page

  Scenario: Perform an advanced search
    When I click on the link "Advanced search"
    Then I go to the search page

  Scenario: Browse the catalogue
    When I click on the link "browsing our catalogue"
    Then I go to the browse page

  Scenario: View all help
    When I click on the link "help guides"
    Then I go to the help page

  Scenario: View help on requests
    When I click on the link "What are requests?"
    Then I go to the requests help page

  Scenario: Manage my requests
    Given I have 1 or more data requests
    When I click on the button "Manage my requests"
    Then I go to the requests page

  Scenario: Scroll through my requests
    Given I have 4 or more data requests
    When I click the arrow buttons in the requests scroll area
    Then The requests scroll to show more

  Scenario: Browse the catalogue when there are no requests
    Given I have no data requests
    When I click the link "browse"
    Then I go to the browse page

  Scenario: Search the catalogue when there are no requests
    Given I have no data requests
    When I click the link "search"
    Then I go to the search page
