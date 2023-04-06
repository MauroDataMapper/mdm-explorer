/*
Copyright 2022-2023 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { AlertComponent, AlertStyle } from './alert.component';

describe('AlertComponent', () => {
  let harness: ComponentHarness<AlertComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(AlertComponent);
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  it('should have no icon when icon is disabled', () => {
    harness.component.showIcon = false;
    harness.detectChanges();
    expect(harness.component.iconName).toBeFalsy();
  });

  it.each<[string, AlertStyle]>([
    ['', 'none'],
    ['fa-check-circle', 'success'],
    ['fa-info-circle', 'info'],
    ['fa-exclamation-triangle', 'warning'],
    ['fa-times-circle', 'error'],
  ])('should use "%s" icon for %s style', (expected, style) => {
    harness.component.showIcon = true;
    harness.component.alertStyle = style;
    harness.detectChanges();
    expect(harness.component.iconName).toBe(expected);
  });

  it('should have no CSS modified when icon is disabled', () => {
    harness.component.showIcon = false;
    harness.detectChanges();
    expect(harness.component.cssModifier).toBeFalsy();
  });

  it.each<[string, AlertStyle]>([
    ['', 'none'],
    ['mdm-alert--success', 'success'],
    ['mdm-alert--info', 'info'],
    ['mdm-alert--warning', 'warning'],
    ['mdm-alert--error', 'error'],
  ])('should use "%s" CSS modifier for %s style', (expected, style) => {
    harness.component.showIcon = true;
    harness.component.alertStyle = style;
    harness.detectChanges();
    expect(harness.component.cssModifier).toBe(expected);
  });
});
