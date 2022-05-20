Feature: Add and remove data elements from data requests
  As an authenticated user
  I want to add or remove data elements from my data requests through the Mauro Data Explorer

  Background:
    Given I am signed in
    And I have at least two data requests open

  Scenario: Add a single data element to a request from the search listing
    Given I search for the search term "episode"
    When I click on the "Add to request" button for the top search result
    And I tick an unchecked box next to a data request in the menu
    Then I see a confirmation saying the elements was added to the request

  Scenario: Add multiple data elements to a request from the search listing
    Given I search for the search term "episode"
    And I tick one or more checkboxes in the search results
    When I click the "With selected..." button
    And I click on a data request button
    Then I see a confirmation saying the elements was added to the request

  Scenario: Add all data elements to a request from the search listing
    Given I search for the search term "episode"
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click on a data request button
    Then I see a confirmation saying the elements was added to the request

  Scenario: Remove a single data element from a request from the search listing
    Given I search for the search term "episode"
    When I click on the "Add to request" button for the top search result
    And I untick a checked box next to a data request in the menu
    Then I see a confirmation saying the elements were removed from the request

  Scenario: Add a single data element to a request from its detail page
    Given I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"
    When I click on the "Add to request" button for the top search result
    And I tick an unchecked box next to a data request in the menu
    Then I see a confirmation saying the elements was added to the request

  Scenario: Remove a single data element from a request from its detail page
    Given I browse for the data class "ICU > Admissions"
    And I view the details of the data element "ICU discharge date time"
    When I click on the "Add to request" button for the top search result
    And I untick a checked box next to a data request in the menu
    Then I see a confirmation saying the elements were removed from the request

  Scenario: Add a single data element to a request from the bookmarks
    Given I go to the bookmarks page
    When I click on the "Add to request" button for the top bookmark
    And I tick an unchecked box next to a data request in the menu
    Then I see a confirmation saying the elements was added to the request

  Scenario: Add multiple data elements to a request from the bookmarks
    Given I go to the bookmarks page
    And I tick one or more checkboxes in the bookmarks
    When I click the "With selected..." button
    And I click on a data request button
    Then I see a confirmation saying the elements was added to the request

  Scenario: Add all data elements to a request from the bookmarks
    Given I go to the bookmarks page
    And I tick the "Select all" checkbox
    When I click the "With selected..." button
    And I click on a data request button
    Then I see a confirmation saying the elements was added to the request

  Scenario: Remove a single data element from a request from the bookmarks
    Given I go to the bookmarks page
    When I click on the "Add to request" button for the top bookmark
    And I untick a checked box next to a data request in the menu
    Then I see a confirmation saying the elements were removed from the request
