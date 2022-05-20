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
