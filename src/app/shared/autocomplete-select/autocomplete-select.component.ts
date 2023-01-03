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
import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroupDirective,
  NgControl,
  NgForm,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ErrorStateMatcher, mixinErrorState } from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  startWith,
  Subject,
  tap,
  takeUntil,
} from 'rxjs';

/* eslint-disable @typescript-eslint/member-ordering */

/**
 * Represents a single option to interact with in the {@link AutocompleteSelectComponent}.
 */
export interface AutocompleteSelectOption {
  /**
   * The display name of this option to view in the control.
   */
  name: string;

  /**
   * The value that the option represents.
   */
  value: any;
}

/**
 * Represents a set of {@link AutocompleteSelectOption} values.
 */
export interface AutocompleteSelectOptionSet {
  /**
   * The total count of options found.
   *
   * This does not have to be the same as the length of the {@link options} array. This could
   * represent the total number of search results found in a query, with only the top set of results
   * actually returned.
   */
  count: number;

  /**
   * The collection of options to display.
   */
  options: AutocompleteSelectOption[];
}

export const isAutocompleteSelectOption = (
  value: any
): value is AutocompleteSelectOption => {
  const hasName = value?.name;
  const hasValue = value?.value;
  return hasName || hasValue;
};

export const isAutocompleteSelectOptionArray = (
  value: any
): value is AutocompleteSelectOption[] => {
  if (!Array.isArray(value)) {
    return false;
  }

  const array = value as any[];
  return array.every((item) => isAutocompleteSelectOption(item));
};

/**
 * Base mixin class for the {@link AutocompleteSelectComponent}.
 *
 * Created as part of the setup for the component to use the {@link MatFormFieldControl} type.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
const _AutocompleteSelectComponentMixinBase = mixinErrorState(
  class {
    /**
     * Emits whenever the component state changes and should cause the parent
     * form-field to update. Implemented as part of `MatFormFieldControl`.
     */
    readonly stateChanges = new Subject<void>();

    constructor(
      public _elementRef: ElementRef,
      public _defaultErrorStateMatcher: ErrorStateMatcher,
      public _parentForm: NgForm,
      public _parentFormGroup: FormGroupDirective,
      /**
       * Form control bound to the component.
       * Implemented as part of `MatFormFieldControl`.
       */
      public ngControl: NgControl
    ) {}
  }
);

/**
 * Component to perform an autocomplete search and select options from the results.
 *
 * Supports single and multi-select via the {@link AutocompleteSelectComponent.multiple} input.
 *
 * This component supports integration with Angular Forms and the Angular Material `mat-form-field` component.
 *
 * To have interactive options be presented to the autocomplete list while typing, you need to set the
 * {@link AutocompleteSelectComponent.searchResults} input binding, then attach to the
 * {@link AutocompleteSelectComponent.searchChange} output binding. The output will respond to changes in the search text
 * entered, this will then allow the parent component to decide what options to present based in this change and set back
 * to the {@link AutocompleteSelectComponent.searchResults} input to rerender the autocomplete list.
 *
 * An example of a parent component:
 *
 * Template:
 *
 * ```html
 * <div>
 *   <mdm-autocomplete-search [searchResults]="myResults" (searchChange)="searchChanged($event)">
 *   </mdm-autocomplete-search>
 * </div>
 * ```
 *
 * Code:
 *
 * ```ts
 * class MyComponent {
 *   // Bind to the component input with initial value
 *   myResults: AutocompleteSelectOptionSet = { count: 0, options: [] };
 *
 *   searchChanged(value: string | undefined) {
 *     // New text entered, perform some kind of search to get new results
 *     fetchFromServer(value).pipe(
 *       map(response => {
 *        return {
 *          count: response.body.count,
 *          options: response.body.items.map((item) => {
 *            return {
 *              name: item.label,
 *              value: item,
 *            };
 *          }),
 *        };
 *       })
 *     )
 *     .subscribe(results => this.myResults = results)
 *   }
 * }
 * ```
 */
@Component({
  selector: 'mdm-autocomplete-select',
  templateUrl: './autocomplete-select.component.html',
  styleUrls: ['./autocomplete-select.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: AutocompleteSelectComponent,
    },
  ],
})
export class AutocompleteSelectComponent
  extends _AutocompleteSelectComponentMixinBase
  implements
    OnInit,
    OnDestroy,
    DoCheck,
    ControlValueAccessor,
    MatFormFieldControl<AutocompleteSelectOption[]>
{
  private static nextUniqueId = 0;

  @HostBinding()
  id = `mdm-autocomplete-select-${AutocompleteSelectComponent.nextUniqueId++}`;

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  /**
   * Display the search results in the autocomplete dropdown.
   *
   * Provide a list of options and a total count to represent the total number of matches found.
   */
  @Input() searchResults: AutocompleteSelectOptionSet = { count: 0, options: [] };

  /**
   * State if the number of matches found should be displayed in the component.
   */
  @Input() displayMatchCount = true;

  /**
   * State if the component should allow multiple selections.
   */
  @Input() get multiple(): boolean {
    return this._multiple;
  }

  set multiple(value: BooleanInput) {
    this._multiple = coerceBooleanProperty(value);
  }

  @Input() get value(): AutocompleteSelectOption[] | null {
    return this._selectionModel.selected;
  }

  set value(newValue: AutocompleteSelectOption[] | null) {
    this.assignValue(newValue);
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return (
      this._required ??
      this.ngControl?.control?.hasValidator(Validators.required) ?? // eslint-disable-line @typescript-eslint/unbound-method
      false
    );
  }

  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  @Input() get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    if (this._disabled) {
      this.searchCtrl.disable();
    } else {
      this.searchCtrl.enable();
    }
  }

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('aria-describedby') userAriaDescribedBy?: string | undefined;

  /**
   * Output event raised when the selection(s) have changed.
   *
   * Attach to this event handler if not using the component in an Angular Form.
   */
  @Output() selectionChange = new EventEmitter<AutocompleteSelectOption[]>();

  /**
   * Output event raised when a new search value has been entered in the autocomplete text input field.
   *
   * When raised, set the {@link AutocompleteSelectComponent.searchResults} input binding with a new value to
   * render the new changes.
   */
  @Output() searchChange = new EventEmitter<string | undefined>();

  searchCtrl = new FormControl();
  focused = false;
  controlType?: string | undefined = 'mdm-autocomplete-select';

  private _multiple = false;
  private _touched = false;
  private _disabled = false;
  private _placeholder = '';
  private _required: boolean | undefined;
  private _selectionModel = new SelectionModel<AutocompleteSelectOption>(true);
  private _unsubscribe$ = new Subject<void>();

  /** Part of the ControlValueAccessor interface */
  private _onChange: (values: AutocompleteSelectOption[]) => void = (_) => {};

  /** Part of the ControlValueAccessor interface */
  private _onTouched = () => {};

  /**
   * Gets the current list of selected options.
   */
  get selected(): AutocompleteSelectOption[] {
    return this._selectionModel.selected;
  }

  get empty(): boolean {
    return this._selectionModel.isEmpty();
  }

  get showMatchCount() {
    return (
      this.displayMatchCount && this.searchCtrl.value && this.searchCtrl.value.length > 0
    );
  }

  get shouldLabelFloat() {
    return (
      this.focused ||
      !this.empty ||
      (this.searchCtrl.value && this.searchCtrl.value.length > 0)
    );
  }

  constructor(
    elementRef: ElementRef,
    defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() parentForm: NgForm,
    @Optional() parentFormGroup: FormGroupDirective,
    @Optional() @Self() ngControl: NgControl,
    private _focusMonitor: FocusMonitor
  ) {
    super(elementRef, defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    this._focusMonitor
      .monitor(this._elementRef.nativeElement as HTMLElement, true)
      .pipe(
        // Use delay to prevent ExpressionChangedAfterItHasBeenCheckedError
        delay(0),
        tap((focusOrigin) => {
          this.focused = !!focusOrigin;
          this.stateChanges.next();
        })
      )
      .subscribe();

    this.searchCtrl.valueChanges
      .pipe(
        takeUntil(this._unsubscribe$),
        startWith(''),
        debounceTime(400),
        distinctUntilChanged(),
        filter((val) => typeof val === 'string')
      )
      .subscribe((value: string | undefined) => {
        this.searchChange.emit(value);
      });
  }

  ngOnInit(): void {
    this._selectionModel = new SelectionModel<AutocompleteSelectOption>(this.multiple);
    this.stateChanges.next();
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef.nativeElement as HTMLElement);
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  ngDoCheck(): void {
    this.updateErrorState();
  }

  clearSearch() {
    this.searchCtrl.setValue('');
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
  }

  selectOption(event: MatAutocompleteSelectedEvent) {
    if (this.disabled) {
      return;
    }

    const option = event.option.value as AutocompleteSelectOption;
    this._selectionModel.select(option);
    this.clearSearch();
    this.propagateChanges();
    this.markAsTouched();
  }

  deselectOption(option: AutocompleteSelectOption) {
    if (this.disabled) {
      return;
    }

    this._selectionModel.deselect(option);
    this.propagateChanges();
    this.markAsTouched();
  }

  /**
   * Function callback to use with `mat-autocomplete` to render the correct string.
   *
   * Note: use of function asignment "=" is intentional to use correct "this" binding.
   */
  displayWith = (val: AutocompleteSelectOption): string => {
    return val?.name;
  };

  focus() {
    if (!this.focused) {
      this._elementRef.nativeElement.focus();
    }
  }

  setDescribedByIds(ids: string[]): void {
    this.userAriaDescribedBy = ids.join(' ');
  }

  onContainerClick(): void {
    this.focus();
  }

  writeValue(value: AutocompleteSelectOption[] | null): void {
    this.assignValue(value);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private assignValue(newValue: AutocompleteSelectOption[] | null): boolean {
    if (!newValue) {
      return false;
    }

    this._selectionModel.clear();
    newValue.forEach((val) => this._selectionModel.select(val));
    this.propagateChanges();
    return true;
  }

  private propagateChanges() {
    this._onChange(this.selected);
    this.selectionChange.emit(this.selected);
    this.stateChanges.next();
  }

  private markAsTouched() {
    if (!this._touched) {
      this._onTouched();
      this._touched = true;
    }
  }
}
