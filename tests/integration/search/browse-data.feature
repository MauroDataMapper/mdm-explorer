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
Feature: Browse the catalogue
  As an authenticated user
  I want to browse the metadata catalogue to broadly find what I'm looking for

  Background:
    Given I am signed in
    And I go to the browse page

  Scenario: Initial view of the browse page
    Then I see a list of values under "Please select a schema..."
    And I see an empty list of values under "Please select a data class..."
    And The "View details" button is disabled

  Scenario: Select a schema
    When I click on a value in the schema list
    Then The data class list will populate with values

  Scenario: Select a different schema
    When I click on a value in the schema list
    And I click on a different value in the schema list
    Then The data class list will change to match the current selected schema

  Scenario: Select a data class
    When I click on a value in the schema list
    And I click on a value in the data class list
    Then The "View details" button is enabled

  Scenario: View details of a data class
    When I click on a value in the schema list
    And I click on a value in the data class list
    And I click on the "View details" button
    Then I go to the search listing page
    And I see the list of data elements under that data class
