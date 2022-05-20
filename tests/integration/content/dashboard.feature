Feature: Dashboard
  As an authenticated user
  I want an overview of my account when I start using the explorer

  Background:
    Given I am signed in
    And I go to the dashboard page

  Scenario: Search the catalogue
    When I enter the search term "episode"
    Then I go to the search listings page

  Scenario: Perform an advanced search
    When I click on the link "Advanced search"
    Then I go to the search page

  Scenario: Manage my requests
    When I click on the button "Manage my requests"
    Then I go to the requests page

  Scenario: Scroll through my requests
    Given I have 3 or more data requests
    When I click the arrow buttons in the requests scroll area
    Then The requests scroll to show more
