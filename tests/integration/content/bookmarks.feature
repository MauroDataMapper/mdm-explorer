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
