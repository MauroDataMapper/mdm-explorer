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
Feature: Managing bookmarks
  As an authenticated user
  I want to view and manage my bookmarked data elements

  Background:
    Given I am signed in
    And I go to the bookmarks page

  Scenario: No bookmarks listed
    Given I have not bookmarked any data elements
    Then The list of bookmarks is empty

  Scenario: View details of a data element
    When I click on the link "View details" for a bookmark
    Then I go to the details page of that data element

  Scenario: Remove a single bookmark
    When I click the solid bookmark icon of a bookmarked data element
    Then The bookmark is removed from the list
    And A success message is shown

  Scenario: Remove multiple bookmarks
    When I tick the checkbox for one or more bookmarks
    And I click on the "With selected..." button
    And I click the "Remove from bookmarks" button
    Then The selected bookmarks are removed from the list

  Scenario: Remove all bookmarks
    When I tick the "Select all" checkbox
    And I click on the "With selected..." button
    And I click the "Remove from bookmarks" button
    Then All bookmarks are removed from the list
