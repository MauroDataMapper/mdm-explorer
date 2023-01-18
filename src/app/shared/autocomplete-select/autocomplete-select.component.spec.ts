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
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MockComponent } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import {
  AutocompleteSelectComponent,
  AutocompleteSelectOption,
} from './autocomplete-select.component';

describe('AutocompleteSelectComponent', () => {
  let harness: ComponentHarness<AutocompleteSelectComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(AutocompleteSelectComponent, {
      declarations: [MockComponent(MatAutocomplete)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('multiple input', () => {
    beforeEach(() => {
      expect(harness.component.multiple).toBeFalsy();
    });

    it.each([
      [true, true],
      [false, false],
      ['true', true],
      ['false', false],
    ])('should set the multiple input correctly from %p to %p', (value, expected) => {
      harness.component.multiple = value;
      expect(harness.component.multiple).toBe(expected);
    });
  });

  describe('disabled input', () => {
    beforeEach(() => {
      expect(harness.component.disabled).toBeFalsy();
    });

    it.each([
      [true, true],
      [false, false],
      ['true', true],
      ['false', false],
    ])('should set the disabled input correctly from %p to %p', (value, expected) => {
      harness.component.disabled = value;
      expect(harness.component.disabled).toBe(expected);
      if (expected) {
        expect(harness.component.searchCtrl.disabled).toBeTruthy();
      } else {
        expect(harness.component.searchCtrl.disabled).toBeFalsy();
      }
    });
  });

  describe('value input', () => {
    beforeEach(() => {
      expect(harness.component.value).toStrictEqual([]);
    });

    it('should match the selected property value', () => {
      expect(harness.component.selected).toStrictEqual([]);

      harness.component.value = [
        {
          name: 'option1',
          value: {},
        },
        {
          name: 'option2',
          value: {},
        },
      ];

      expect(harness.component.value).toStrictEqual(harness.component.selected);
    });

    it('should raise change events when value changes', () => {
      // Initial value
      harness.component.value = [
        {
          name: 'option1',
          value: {},
        },
        {
          name: 'option2',
          value: {},
        },
      ];

      // Set event spies
      const selectedChangeSpy = jest.spyOn(harness.component.selectionChange, 'emit');
      const stateChangesSpy = jest.spyOn(harness.component.stateChanges, 'next');
      let onChangeCalled = false;
      harness.component.registerOnChange(() => (onChangeCalled = true));

      // Changed value
      const newSelection = [
        {
          name: 'option1',
          value: {},
        },
      ];
      harness.component.value = newSelection;

      expect(selectedChangeSpy).toHaveBeenCalledWith(newSelection);
      expect(stateChangesSpy).toHaveBeenCalled();
      expect(onChangeCalled).toBe(true);
    });
  });

  describe('empty property', () => {
    beforeEach(() => {
      expect(harness.component.empty).toBeTruthy();
    });

    it('should not be empty when values are selected', () => {
      harness.component.value = [
        {
          name: 'option1',
          value: {},
        },
      ];

      expect(harness.component.empty).toBeFalsy();
    });
  });

  describe('showMatchCount property', () => {
    beforeEach(() => {
      expect(harness.component.displayMatchCount).toBeTruthy();
      expect(harness.component.showMatchCount).toBeFalsy();
    });

    it('should not show match count when displayMatchCount is false', () => {
      // Enter a value but force display off
      harness.component.displayMatchCount = false;
      harness.component.searchCtrl.setValue('test');

      expect(harness.component.showMatchCount).toBeFalsy();
    });

    it('should not show match count when no text entered', () => {
      harness.component.displayMatchCount = true;
      harness.component.searchCtrl.setValue('');

      expect(harness.component.showMatchCount).toBeFalsy();
    });

    it('should show match count when text entered', () => {
      harness.component.displayMatchCount = true;
      harness.component.searchCtrl.setValue('test');

      expect(harness.component.showMatchCount).toBeTruthy();
    });
  });

  describe('clearSearch', () => {
    it('should clear current text', () => {
      harness.component.searchCtrl.setValue('test');
      harness.component.clearSearch();
      expect(harness.component.searchCtrl.value).toBe('');
    });
  });

  describe('selectOption', () => {
    const option: AutocompleteSelectOption = {
      name: 'test',
      value: {},
    };

    const event = {
      option: {
        value: option,
      },
    } as MatAutocompleteSelectedEvent;

    it('should do nothing when disabled', () => {
      const selectionChangeSpy = jest.spyOn(harness.component.selectionChange, 'emit');

      harness.component.disabled = true;
      harness.component.selectOption(event);

      expect(selectionChangeSpy).not.toHaveBeenCalled();
    });

    it('should add option to selected list', () => {
      const initialSelection = [
        {
          name: 'first',
          value: {},
        },
      ];

      // Initial state
      harness.component.searchCtrl.setValue('test');
      harness.component.value = initialSelection;

      const selectionChangeSpy = jest.spyOn(harness.component.selectionChange, 'emit');

      harness.component.selectOption(event);

      expect(selectionChangeSpy).toHaveBeenCalledWith(initialSelection.concat(option));
      expect(harness.component.searchCtrl.value).toBe('');
    });
  });

  describe('deselectOption', () => {
    const option: AutocompleteSelectOption = {
      name: 'test',
      value: {},
    };

    it('should do nothing when disabled', () => {
      const selectionChangeSpy = jest.spyOn(harness.component.selectionChange, 'emit');

      harness.component.disabled = true;
      harness.component.deselectOption(option);

      expect(selectionChangeSpy).not.toHaveBeenCalled();
    });

    it('should remove option from selected list', () => {
      const initialSelection = [
        {
          name: 'first',
          value: {},
        },
        option,
      ];

      // Initial state
      harness.component.value = initialSelection;

      const selectionChangeSpy = jest.spyOn(harness.component.selectionChange, 'emit');

      harness.component.deselectOption(option);

      expect(selectionChangeSpy).toHaveBeenCalledWith(initialSelection.splice(0, 1));
    });
  });
});
