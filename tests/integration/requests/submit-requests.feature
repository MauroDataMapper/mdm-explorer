Feature: Submitting requests
  As an authenticated user
  I want to submit my data access requests to be processed further

  Background:
    Given I am signed in
    And I go to the requests page
    And I have at least one unsent request
    And I have at least one submitted request

  Scenario: Submit a request
    When I click on an unsent request
    And I click on the "Submit request" button
    Then I see a confirmation that the request was submitted
    And The status of the request changes to "submitted"
    And The number of requests decreases in the header

  Scenario: Create a new version of a request
    When I click on a submitted request
    And I click on the "Create new version" button
    Then I see a confirmation that the next version of my request was created
    And A new request with the same name appears in the request list
    And The number of requests increases in the header
