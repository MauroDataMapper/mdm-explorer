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
Feature: Viewing and interacting with search results
  As an authenticated user
  I want to view the search results when I browse or search the metadata catalogue

  Background:
    Given I am signed in

  Scenario: Go back to the browse page
    When I browse for the data class "ICU > Admissions"
    And I click the link "Back to browsing compartments"
    Then I go to the browse page

  Scenario: Go back to the search page
    When I search for the search term "episode"
    And I click the link "Back to search fields"
    Then I go to the search page
    And The search term is auto-populated in the search form

  Scenario: Initial view of the browse results
    When I browse for the data class "ICU > Admissions"
    Then I search results page search field is empty
    And I see a list of search results
    And I see the total number of search results available
    And I see the breadcrumb for the data class

  Scenario: Initial view of the search results
    When I search for the search term "episode"
    Then I see the search term in the search results page search field
    And I see a list of search results
    And I see the total number of search results available

  Scenario: Go to next page of results
    When I search for the search term "episode"
    And I click the next page button ">"
    Then The search results list changes

  Scenario: Go to last page of results
    When I search for the search term "episode"
    And I click the last page button ">>"
    Then The search results list changes

  Scenario: Go to previous page of results
    When I search for the search term "episode"
    And I go to a page that is not the first page
    And I click the previous page button "<"
    Then The search results list changes

  Scenario: Go to first page of results
    When I search for the search term "episode"
    And I go to a page that is not the first page
    And I click the first page button "<<"
    Then The search results list changes

  Scenario: Sort by label descending
    When I search for the search term "episode"
    And I change the sort order to "Label (z-a)"
    Then The search results list changes

  Scenario: Use search filters
    When I search for the search term "episode"
    And I change search filter "Identifable data" to "Identifying"
    Then The search results list changes

  Scenario: Change the search term
    When I search for the search term "episode"
    And I enter the new search term "volume" in the search listing page
    Then The search results list changes

  Scenario: Bookmark a search result
    When I search for the search term "episode"
    And I click on the empty bookmark icon of a search result
    Then The bookmark icon changes to be solid
    And A bookmark added success message is shown

  Scenario: View details of a search result
    When I search for the search term "episode"
    And I click the "View details" link of a search result
    Then I go to the details page of that search result

  Scenario: Multiple selection of search results
    When I search for the search term "episode"
    And I tick one or more checkboxes in the search results
    Then The button "With selected..." is enabled

  Scenario: Select all search results
    When I search for the search term "episode"
    And I tick the "Select all" checkbox
    Then All search results in the list are checked
    And The button "With selected..." is enabled
