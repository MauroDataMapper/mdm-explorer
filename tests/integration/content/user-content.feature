Feature: Accessing user content
  As an authenticated user
  I want to see restricted, user-only content in the Mauro Data Explorer

  Background:
    Given I am signed in

  Scenario: Seeing all available links in the header
    Given I am on the dashboard page
    Then I can see all page links in the header

  Scenario: Viewing the dashboard page
    When I click on the main header logo
    Then I go to the dashboard page

  Scenario: Viewing the browse page
    When I click on the "Browse" link in the header
    Then I go to the browse page

  Scenario: Viewing the search page
    When I click on the "Search" link in the header
    Then I go to the search page

  Scenario: Viewing the bookmarks page
    When I click on the "Bookmarks" link in the header
    Then I go to the bookmarks page

  Scenario: Viewing the requests page
    When I click on the "My requests" link in the header
    Then I go to the requests page

  Scenario: Viewing the account page
    When I click on the avatar icon in the header
    Then I go to the account page
