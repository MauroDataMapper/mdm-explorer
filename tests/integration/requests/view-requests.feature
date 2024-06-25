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
Feature: Viewing data specifications
  As an authenticated user
  I want to view my draft and submitted data specifications and manage them

  Background:
    Given I am signed in
    And I go to the data specifications page

  Scenario: No data specifications available
    Given I have not created any data specifications yet
    Then I see an empty page

  Scenario Outline: Filter the data specifications list
    When I click on the checkbox "<status>"
    Then The data specification list is filtered to show those matching the status "<status>"

    Examples:
      | status    |
      | draft    |
      | submitted |

  Scenario: View data elements in a data specification
    When I click on a data specification from the data specification list
    Then The details panel of the data specification changes the label to match the selected data specification
    And The list of data elements changes

  Scenario: Remove a single data element from an draft data specification
    Given I have selected an draft data specification to view
    When I click the "Remove" button from the top data element in the list
    Then The data element is removed from the data specification

  Scenario: Remove multiple data elements from an draft data specification
    Given I have selected an draft data specification to view
    And And I tick one or more checkboxes in the data elements list
    When I click the "Remove selected" button
    Then The selected data elements are removed from the data specification

  Scenario: Remove all data elements from an draft data specification
    Given I have selected an draft data specification to view
    And And I tick the "Select all" checkbox
    When I click the "Remove selected" button
    Then The selected data elements are removed from the data specification
