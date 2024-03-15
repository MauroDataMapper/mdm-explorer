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
import { TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { NumberFormatDirective } from './number-format.directive';

class MockNgControl extends NgControl {
  control = new FormControl();
  viewToModelUpdate() {}
}

describe('IntegerOnlyDirective', () => {
  let directive: NumberFormatDirective;
  const mockNgControl = new MockNgControl();

  let integerInputSpy: jest.SpyInstance;
  let decimalInputSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NumberFormatDirective, { provide: NgControl, useValue: mockNgControl }],
    });

    directive = TestBed.inject(NumberFormatDirective);

    // Hookup spy's.
    integerInputSpy = jest.spyOn(directive, 'attemptToParseIntegerInput');
    decimalInputSpy = jest.spyOn(directive, 'attemptToParseDecimalInput');

    // Need to emit an initial value for the control as it skips the emission
    // of the initial value.
    directive.ngOnInit();
    mockNgControl.control.setValue(null);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  describe('the control flow of the subscription', () => {
    it('should not call either parsing method if value of control is null', () => {
      mockNgControl.control.setValue(null);

      expect(integerInputSpy).not.toHaveBeenCalled();
      expect(decimalInputSpy).not.toHaveBeenCalled();
    });

    it('should call attemptToParseIntegerInput if numberFormat is integer', () => {
      directive.numberFormat = 'integer';
      mockNgControl.control.setValue('123');
      expect(integerInputSpy).toHaveBeenCalledWith('123');
    });

    it('should call attemptToParseDecimalInput if numberFormat is decimal', () => {
      directive.numberFormat = 'decimal';
      mockNgControl.control.setValue('123');
      expect(decimalInputSpy).toHaveBeenCalledWith('123');
    });
  });

  describe('attemptToParseIntegerInput()', () => {
    it.each([
      ['-', '-'],
      ['-', '---'],
      ['-', '-='],
      ['-', '-asdb'],
      ['-', '-.'],
      ['-', '-..'],
      ['', '.'],
      ['', '..'],
      [-12, '-12'],
      [-1234, '-12.34'],
      [12, '12s'],
      [12, '12-'],
      [12, '12.'],
      [12, '12sdf'],
      [1234, '12sdf34'],
      [123, '123'],
      [123456, '123.456'],
    ])('should return %p when the input is %p', (expected, input) => {
      directive.numberFormat = 'integer';
      mockNgControl.control.setValue(input);

      expect(integerInputSpy).toHaveBeenCalledWith(input);
      expect(integerInputSpy).toHaveReturnedWith(expected);
    });
  });

  describe('attemptToParseDecimalInput()', () => {
    it.each([
      ['-', '-'],
      ['-', '--'],
      ['.', '.'],
      ['.', '..'],
      ['-.', '-.'],
      ['-.', '----.'],
      ['-.', '-.....'],
      [-0.1, '----.1'],
      [-12, '-12'],
      [-12.34, '-12.34'],
      ['12.', '12.'],
      [12, '12-'],
      [12, '12sdf'],
      [123, '123'],
      [123.456, '123.456'],
    ])('should return %p when the input is %p', (expected, input) => {
      directive.numberFormat = 'decimal';
      mockNgControl.control.setValue(input);

      expect(decimalInputSpy).toHaveBeenCalledWith(input);
      expect(decimalInputSpy).toHaveReturnedWith(expected);
    });
  });
});
