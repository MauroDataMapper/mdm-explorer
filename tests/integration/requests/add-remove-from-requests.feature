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
Feature: Add and remove data elements from data specifications
  As an authenticated user
  I want to add or remove data elements from my data specifications through the Mauro Data Explorer

  Background:
    Given I am signed in
    And I have at least two data specifications open

  Scenario: Add a single data element to a data specification from the search listing
    Given I search for the search term "episode"
    When I click on the "Add to data specification" button for the top search result
    And I tick an unchecked box next to a data specification in the menu
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Add multiple data elements to a data specification from the search listing
    Given I search for the search term "episode"
    And I tick one or more checkboxes in the search results
    When I click the "With selected..." button
    And I click on a data specification button
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Add all data elements to a data specification from the search listing
    Given I search for the search term "episode"
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click on a data specification button
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Remove a single data element from a data specification from the search listing
    Given I search for the search term "episode"
    When I click on the "Add to data specification" button for the top search result
    And I untick a checked box next to a data specification in the menu
    Then I see a confirmation saying the elements were removed from the data specification

  Scenario: Add a single data element to a data specification from its detail page
    Given I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"
    When I click on the "Add to data specification" button for the top search result
    And I tick an unchecked box next to a data specification in the menu
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Remove a single data element from a data specification from its detail page
    Given I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"
    When I click on the "Add to data specification" button for the top search result
    And I untick a checked box next to a data specification in the menu
    Then I see a confirmation saying the elements were removed from the data specification

  Scenario: Add a single data element to a data specification from the bookmarks
    Given I go to the bookmarks page
    When I click on the "Add to data specification" button for the top bookmark
    And I tick an unchecked box next to a data specification in the menu
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Add multiple data elements to a data specification from the bookmarks
    Given I go to the bookmarks page
    And I tick one or more checkboxes in the bookmarks
    When I click the "With selected..." button
    And I click on a data specification button
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Add all data elements to a data specification from the bookmarks
    Given I go to the bookmarks page
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click on a data specification button
    Then I see a confirmation saying the elements was added to the data specification

  Scenario: Remove a single data element from a data specification from the bookmarks
    Given I go to the bookmarks page
    When I click on the "Add to data specification" button for the top bookmark
    And I untick a checked box next to a data specification in the menu
    Then I see a confirmation saying the elements were removed from the data specification
