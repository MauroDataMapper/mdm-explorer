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
Feature: Search the catalogue
  As an authenticated user
  I want to search the metadata catalogue to narrow down what I'm looking for

  Background:
    Given I am signed in
    And I go to the search page

  Scenario: Initial view of the search page
    Then I see an empty search field
    And The "Search" button is enabled

  Scenario Outline: Search with a simple search term
    When I type "<term>" into the search field
    And I click the "Search" button
    Then I go to the search listing page
    And I see the list of results matching my criteria

    Examples:
      | term    |
      | episode |
      | patient |
      | volume  |

  Scenario Outline: Search with search term and filters
    When I type "<term>" into the search field
    And I select additional filters
    And I click the "Search" button
    Then I go to the search listing page
    And I see the list of results matching my criteria

    Examples:
      | term    |
      | episode |
      | patient |
      | volume  |
