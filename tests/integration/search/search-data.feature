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
