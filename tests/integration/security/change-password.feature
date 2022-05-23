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
Feature: Changing a user's password
  As an authenticated user
  I want to be able to change my password

  Background:
    Given I am signed in
    And I go to the account page
    And I click on the "Change password" button

  Scenario: Go back to the account page
    When I click on the link "Back to my account"
    Then I got to the account page

  Scenario: Leave the form empty
    When I enter no values in the form
    Then The "Update" button is disabled
    And The current password field says "Please enter your current password"
    And The new password field says "Please enter your new password"
    And The confirm password field says "Please enter your new password again"

  Scenario Outline: Toggle password visibility in form fields
    When I enter a value in the field "<field>"
    And I click on the visibility toggle for the field "<field>"
    Then I see the plain text for the field "<field>"

    Examples:
      | field           |
      | currentPassword |
      | newPassword     |
      | confirmPassword |

  Scenario Outline: Leave a form field empty
    When I enter no value in the field "<field>"
    Then The "Update" button is disabled
    And The field "<field>" says "<error>"

    Examples:
      | field           |
      | currentPassword |
      | newPassword     |
      | confirmPassword |

  Scenario Outline: New password has no lower character
    When I enter "<newPassword>" to the new password field
    Then The password strength rule "contains at least one lower character" fails

    Examples:
      | newPassword |
      | PASSWORD1   |

  Scenario Outline: New password has no upper character
    When I enter "<newPassword>" to the new password field
    Then The password strength rule "contains at least one upper character" fails

    Examples:
      | newPassword |
      | password1   |

  Scenario Outline: New password has no digit character
    When I enter "<newPassword>" to the new password field
    Then The password strength rule "contains at least one digit character" fails

    Examples:
      | newPassword |
      | Password$   |

  Scenario Outline: New password is less than 8 characters
    When I enter "<newPassword>" to the new password field
    Then The password strength rule "contains at least 8 characters" fails

    Examples:
      | newPassword |
      | Test1       |

  Scenario Outline: New passwords do not match
    When I enter my new password "<newPassword>" and confirm by typing "<confirmPassword>"
    Then The "Update" button is disabled
    And The confirm password field says "Your new passwords do not match"

  Scenario: Cancel changing password
    When I click the "Cancel" button
    Then I go back to the account page

  Scenario: Change password
    When I enter valid values into the form
    And I click on the "Update" button
    Then I go to the account page
    And I see a success message
