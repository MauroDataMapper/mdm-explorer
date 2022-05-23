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
Feature: Create data requests
  As an authenticated user
  I want to create data requests so I can later submit them and request access to data of interest to me

  Background:
    Given I am signed in

  Scenario: Copy a schema to a new data request
    Given I go to the browse page
    When I hover over a value in the schema list
    And I click on the "..." context menu and click "Copy to new request"
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Copy a data class to a new data request
    Given I go to the browse page
    When I click on a value in the schema list
    And I hover over a value in the data class list
    And I click on the "..." context menu and click "Copy to new request"
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding a single data element from the search listing
    Given I search for the search term "episode"
    When I click on the "Add to request" button for the top search result
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding multiple data elements from the search listing
    Given I search for the search term "episode"
    And I tick one or more checkboxes in the search results
    When I click the "With selected..." button
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding all data elements from the search listing
    Given I search for the search term "episode"
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding a data element from its detail page
    Given I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"
    When I click on the "Add to request" button
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding a single data element from bookmarks
    Given I go to the bookmarks page
    When I click on the "Add to request" button for the top bookmark
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding multiple data elements from bookmarks
    Given I go to the bookmarks page
    And I tick one or more checkboxes in the bookmarks
    When I click the "With selected..." button
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header

  Scenario: Create a new request while adding all data elements from bookmarks
    Given I go to the bookmarks page
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click the "Create new request" button
    And I enter a name for the new request
    And I click the "Create request" button
    Then I see a confirmation saying the request was created
    And The number of requests increases in the header
