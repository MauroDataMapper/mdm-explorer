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
Feature: Accessing public content
  As a site visitor who is not a registered user
  I want to see publicly visible content in the Mauro Data Explorer

  Background:
    Given I am signed out

  Scenario: Viewing the home page
    When I click on the main header logo
    Then I go to the home page

  Scenario Outline: Navigating from the home page to public pages
    Given I am on the home page
    When I click on "<link>"
    Then I go to the page with URL "<url>"

    Examples:
      | link                 | url                   |
      | About                | /about                |
      | Help Section         | /help                 |
      | Privacy policy       | /privacy-policy       |
      | Terms and conditions | /terms-and-conditions |
      | Cookies              | /cookie-policy        |
      | Safeguarding         | /safeguarding         |
      | Site map             | /site-map             |

  Scenario Outline: Navigating from the home page to restricted pages
    Given I am on the home page
    When I click on "<link>"
    Then I go to the sign in page

    Examples:
      | link        |
      | Browse Data |
      | Search Data |

  Scenario: Viewing the about page
    When I click on the "About" link in the header
    Then I go to the about page

  Scenario: Viewing the help page
    When I click on the "Help" link in the header
    Then I go to the help page

  Scenario: Only seeing publicly available links in the header
    Given I am on the home page
    Then I cannot see restricted page links in the header
