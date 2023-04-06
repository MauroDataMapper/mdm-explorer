# Copyright 2022-2023 University of Oxford
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

  Scenario: Copy a submitted request
    When I click on a submitted request
    And I click on the "Copy" button
    And I enter a name for the new request
    Then I see a confirmation that the new request was created
    And A new request with the chosen name appears in the request list
    And The number of requests increases in the header
