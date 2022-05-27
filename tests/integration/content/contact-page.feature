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
Feature: Contact and support
  As a site visitor who is not a registered user
  I want to submit a support request when I need assistance

  Background:
    Given I am not signed in as a user
    And I go to the contact and support page

  Scenario: Leave the support form empty
    When I enter no values in the request support form
    Then The button "Request support" is disabled

  Scenario: Leave mandatory fields empty in the support form
    When I enter no values in the mandator fields of the request support form
    Then The button "Request support" is disabled
    And The first name field says "First name is required"
    And The last name field says "Last name is required"
    And The email field says "Email is required"
    And The subject field says "Subject is required"
    And The message field says "Message is required"

  Scenario Outline: Enter an email address with bad format in the support form
    When I enter values for all mandatory fields in the request support form
    And I enter "<email>" in the email field
    Then The button "Request support" is disabled
    And The email field says "Please enter a valid email address"

    Examples:
      | email     |
      | test      |
      | 123       |
      | test@test |

  Scenario: Submit a support request
    When I enter valid values to the request support form
    And I click the "Request support" button
    Then I see a confirmation that the request was sent

  Scenario: Submit feedback
    When I click the "Send feedback" button
    And I enter a message into the feedback form
    And I click the "Send feedback" button in the dialog
    Then I see a confirmation that the request was sent
