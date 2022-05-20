Feature: Viewing data requests
  As an authenticated user
  I want to view my unsent and submitted data requests and manage them

  Background:
    Given I am signed in
    And I go to the requests page

  Scenario: No requests available
    Given I have not created any data requests yet
    Then I see an empty page

  Scenario Outline: Filter the requests list
    When I click on the checkbox "<status>"
    Then The request list is filtered to show those matching the status "<status>"

    Examples:
      | status    |
      | unsent    |
      | submitted |

  Scenario: View data elements in a request
    When I click on a request from the request list
    Then The details panel of the request changes the label to match the selected request
    And The list of data elements changes

  Scenario: Remove a single data element from an unsent request
    Given I have selected an unsent request to view
    When I click the "Remove" button from the top data element in the list
    Then The data element is removed from the request

  Scenario: Remove multiple data elements from an unsent request
    Given I have selected an unsent request to view
    And And I tick one or more checkboxes in the data elements list
    When I click the "Remove selected" button
    Then The selected data elements are removed from the request

  Scenario: Remove all data elements from an unsent request
    Given I have selected an unsent request to view
    And And I tick the "Select all" checkbox
    When I click the "Remove selected" button
    Then The selected data elements are removed from the request
