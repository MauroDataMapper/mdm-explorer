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
import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, skip } from 'rxjs/operators';

export type NumberFormat = 'integer' | 'decimal';

@Directive({
  selector: 'input[mdmNumberFormat]',
})
export class NumberFormatDirective implements OnInit, OnDestroy {
  @Input() numberFormat: NumberFormat = 'decimal';

  private subscription!: Subscription;

  constructor(private ngControl: NgControl) {}

  ngOnInit() {
    const ctrl = this.ngControl.control;

    if (!ctrl) {
      return;
    }

    this.subscription = ctrl.valueChanges
      .pipe(
        skip(1), // Skip the initial value of the form control. It might already be properly set.
        map((v: string | null) => {
          if (v == null) {
            return v;
          }

          return this.numberFormat === 'integer'
            ? this.attemptToParseIntegerInput(v)
            : this.attemptToParseDecimalInput(v);
        })
      )
      .subscribe((v) => ctrl.setValue(v, { emitEvent: false }));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  attemptToParseIntegerInput(input: string): number | string {
    let partialParse: string = input;
    // If input is any number of '-' symbols, just trim and wait for more input
    // because the user might be in the process of entering a negative number.
    if (!this.beginsWithSingleMinusSign(input)) {
      partialParse = this.removeRepeatedAllowedSymbols(input);
    }

    // Remove all nonInteger symbols (anything not a digit or a '-' sign).
    const nonIntegerNumberSymbols = /[^\d-]*/g;
    const onlyNumberSymbols = partialParse.replace(nonIntegerNumberSymbols, '');

    // Attempt to parse as integer. If not possible to parse,
    // return the cleaned string containing only number symbols.
    if (onlyNumberSymbols) {
      const parsedInt = parseInt(onlyNumberSymbols, 10);
      if (!isNaN(parsedInt)) {
        return parsedInt;
      }
    }
    return onlyNumberSymbols;
  }

  attemptToParseDecimalInput(input: string): number | string {
    let partialParse: string = input;

    // Clean the string if it isn't meet some formatting rules.
    if (
      !this.beginsWithSingleMinusSign(input) ||
      !this.endsWithSingleDecimalPoint(input)
    ) {
      partialParse = this.removeRepeatedAllowedSymbols(input);
    }

    // Await further input before trying to parse as a float.
    if (this.endsWithSingleDecimalPoint(partialParse)) {
      return partialParse;
    }

    // First, remove characters that aren't in the following set {'-', '.', integers}.
    const nonDecimalNumberSymbols = /[^\d-.]/g;
    const onlyNumberSymbols = partialParse.replace(nonDecimalNumberSymbols, '');

    // Attempt to parse as a floating point number. If not possible to parse,
    // return the cleaned string containing only number symbols.
    if (onlyNumberSymbols) {
      const parsedFloat = parseFloat(onlyNumberSymbols);
      if (!isNaN(parsedFloat)) {
        return parsedFloat;
      }
    }
    return onlyNumberSymbols;
  }

  // Allowed symbols are '-', '.' or ',' characters.
  private removeRepeatedAllowedSymbols(input: string): string {
    const repeatedAllowedSymbols = /([-,.])\1+/g;
    return input.replace(repeatedAllowedSymbols, '$1'); // replace with the matched character
  }

  // Allow for decimal point to be ',' as they do in France.
  private endsWithSingleDecimalPoint(input: string): boolean {
    return (
      (input.endsWith('.') && input.indexOf('.') === input.lastIndexOf('.')) ||
      (input.endsWith(',') && input.indexOf(',') === input.lastIndexOf(','))
    );
  }

  private beginsWithSingleMinusSign(input: string): boolean {
    return input.startsWith('-') && input.indexOf('-') === input.lastIndexOf('-');
  }
}
