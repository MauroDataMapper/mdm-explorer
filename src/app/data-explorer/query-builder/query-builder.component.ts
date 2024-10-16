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
/* Original source: https://github.com/zebzhao/Angular-QueryBuilder
MIT License

Copyright (c) 2018 Zeb Zhao

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { QueryOperatorDirective } from './query-operator.directive';
import { QueryFieldDirective } from './query-field.directive';
import { QueryEntityDirective } from './query-entity.directive';
import { QuerySwitchGroupDirective } from './query-switch-group.directive';
import { QueryButtonGroupDirective } from './query-button-group.directive';
import { QueryInputDirective } from './query-input.directive';
import { QueryRemoveButtonDirective } from './query-remove-button.directive';
import { QueryEmptyWarningDirective } from './query-empty-warning.directive';
import { QueryArrowIconDirective } from './query-arrow-icon.directive';
import {
  ButtonGroupContext,
  Entity,
  Field,
  SwitchGroupContext,
  EntityContext,
  FieldContext,
  InputContext,
  LocalRuleMeta,
  OperatorContext,
  Option,
  QueryBuilderClassNames,
  QueryBuilderConfig,
  RemoveButtonContext,
  ArrowIconContext,
  Rule,
  RuleSet,
  EmptyWarningContext,
} from './query-builder.interfaces';
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  EntitySelectorDialogComponent,
  EntitySelectorDialogData,
  EntitySelectorDialogResponse,
} from './dialogs/entity-selector-dialog/entity-selector-dialog.component';

export const CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true,
};

export const VALIDATOR: any = {
  provide: NG_VALIDATORS,
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  useExisting: forwardRef(() => QueryBuilderComponent),
  multi: true,
};

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'query-builder',
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss'],
  providers: [CONTROL_VALUE_ACCESSOR, VALIDATOR],
})
export class QueryBuilderComponent
  implements AfterViewInit, OnInit, OnChanges, ControlValueAccessor, Validator
{
  @Input() disabled = false;
  @Input() data: RuleSet = { condition: 'and', rules: [] };

  @Input() allowRuleset = true;
  @Input() allowCollapse = false;
  @Input() emptyMessage = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
  @Input() classNames!: QueryBuilderClassNames;
  @Input() operatorMap!: { [key: string]: string[] };
  @Input() parentValue!: RuleSet;
  @Input() config: QueryBuilderConfig = { fields: {} };
  @Input() parentArrowIconTemplate!: QueryArrowIconDirective;
  @Input() parentInputTemplates!: QueryList<QueryInputDirective>;
  @Input() parentOperatorTemplate!: QueryOperatorDirective;
  @Input() parentFieldTemplate!: QueryFieldDirective;
  @Input() parentEntityTemplate!: QueryEntityDirective;
  @Input() parentSwitchGroupTemplate!: QuerySwitchGroupDirective;
  @Input() parentButtonGroupTemplate!: QueryButtonGroupDirective;
  @Input() parentRemoveButtonTemplate!: QueryRemoveButtonDirective;
  @Input() parentEmptyWarningTemplate!: QueryEmptyWarningDirective;
  @Input() parentChangeCallback!: () => void;
  @Input() parentTouchedCallback!: () => void;
  @Input() persistValueOnFieldChange = false;
  @Input() ruleSetLevel = 0;
  @Input() isDataQuery = false;

  @Output() removeRuleSetEvent = new EventEmitter<any>();

  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;

  @ContentChild(QueryButtonGroupDirective)
  buttonGroupTemplate!: QueryButtonGroupDirective;
  @ContentChild(QuerySwitchGroupDirective)
  switchGroupTemplate!: QuerySwitchGroupDirective;
  @ContentChild(QueryFieldDirective) fieldTemplate!: QueryFieldDirective;
  @ContentChild(QueryEntityDirective) entityTemplate!: QueryEntityDirective;
  @ContentChild(QueryOperatorDirective) operatorTemplate!: QueryOperatorDirective;
  @ContentChild(QueryRemoveButtonDirective)
  removeButtonTemplate!: QueryRemoveButtonDirective;
  @ContentChild(QueryEmptyWarningDirective)
  emptyWarningTemplate!: QueryEmptyWarningDirective;
  @ContentChildren(QueryInputDirective) inputTemplates!: QueryList<QueryInputDirective>;
  @ContentChild(QueryArrowIconDirective) arrowIconTemplate!: QueryArrowIconDirective;

  public fields?: Field[];
  public filterFields?: Field[];
  public entities?: (Entity | undefined)[] | null | undefined;
  public defaultClassNames: QueryBuilderClassNames = {
    arrowIconButton: 'q-arrow-icon-button',
    arrowIcon: 'q-icon q-arrow-icon',
    removeIcon: 'q-icon q-remove-icon',
    addIcon: 'q-icon q-add-icon',
    button: 'q-button',
    buttonGroup: 'q-button-group',
    removeButton: 'q-remove-button',
    switchGroup: 'q-switch-group',
    switchLabel: 'q-switch-label',
    switchRadio: 'q-switch-radio',
    rightAlign: 'q-right-align',
    centerAlign: 'q-center-align',
    transition: 'q-transition',
    collapsed: 'q-collapsed',
    treeContainer: 'q-tree-container',
    tree: 'q-tree',
    row: 'q-row',
    connector: 'q-connector',
    rule: 'q-rule',
    ruleSet: 'q-ruleset',
    invalidRuleSet: 'q-invalid-ruleset',
    emptyWarning: 'q-empty-warning',
    fieldControl: 'q-field-control',
    fieldControlSize: 'q-control-size',
    entityControl: 'q-entity-control',
    entityControlSize: 'q-control-size',
    operatorControl: 'q-operator-control',
    operatorControlSize: 'q-control-size',
    inputControl: 'q-input-control',
    inputControlSize: 'q-control-size',
  };
  public defaultOperatorMap: { [key: string]: string[] } = {
    // eslint-disable-next-line id-denylist
    string: ['=', '!=', 'contains', 'like'],
    // eslint-disable-next-line id-denylist
    number: ['=', '!=', '>', '>=', '<', '<='],
    time: ['=', '!=', '>', '>=', '<', '<='],
    date: ['=', '!=', '>', '>=', '<', '<='],
    category: ['=', '!=', 'in', 'not in'],
    // eslint-disable-next-line id-denylist
    boolean: ['='],
  };
  public isRuleSetAvailable = true;

  private defaultTemplateTypes = [
    'string',
    'number',
    'time',
    'date',
    'category',
    'boolean',
    'multiselect',
  ];
  private defaultPersistValueTypes: string[] = ['string', 'number', 'time', 'date', 'boolean'];
  private defaultEmptyList: any[] = [];
  private operatorsCache: { [key: string]: string[] } = {};
  private inputContextCache = new Map<Rule, InputContext>();
  private operatorContextCache = new Map<Rule, OperatorContext>();
  private fieldContextCache = new Map<Rule, FieldContext>();
  private entityContextCache = new Map<Rule, EntityContext>();
  private removeButtonContextCache = new Map<Rule, RemoveButtonContext>();
  private buttonGroupContext!: ButtonGroupContext;

  constructor(private changeDetectorRef: ChangeDetectorRef, private matDialog: MatDialog) {}

  // ----------ControlValueAccessor Implementation----------
  @Input()
  get value(): RuleSet {
    return this.data;
  }
  set value(value: RuleSet) {
    // When component is initialized without a formControl, null is passed to value
    this.data = value || { condition: 'and', rules: [] };
    this.handleDataChange();
  }

  // For ControlValueAccessor interface
  public onChangeCallback: () => void = () => {};
  public onTouchedCallback: () => any = () => {};

  // ----------OnInit Implementation----------

  ngOnInit() {}

  // ----------OnChanges Implementation----------

  ngOnChanges(_: SimpleChanges) {
    const config = this.config;
    const type = typeof config;
    if (type === 'object') {
      this.fields = Object.keys(config.fields).map((value) => {
        const field = config.fields[value];
        field.value = field.value || value;
        return field;
      });
      if (config.entities) {
        this.entities = Object.keys(config.entities).map((value) => {
          const entity = config.entities?.[value];
          if (entity) {
            entity.value = entity.value || value;
          }
          return entity;
        });
      } else {
        this.entities = null;
      }
      this.operatorsCache = {};
    } else {
      throw new Error(`Expected 'config' must be a valid object, got ${type} instead.`);
    }
  }

  ngAfterViewInit(): void {
    if (this.ruleSetLevel === 0 && this.config.coreEntityName) {
      if (this.data.entity !== this.config.coreEntityName) {
        // Delay the change until the next change detection cycle
        setTimeout(() => {
          this.data.entity = this.config.coreEntityName;
          this.handleDataChange();
          this.handleTouched();
        }, 0);
      }
    }
  }

  // ----------Validator Implementation----------

  validate(_: AbstractControl): ValidationErrors | null {
    const errors: { [key: string]: any } = {};
    const ruleErrorStore: any[] = [];
    let hasErrors = false;

    if (!this.config.allowEmptyRulesets && this.checkEmptyRuleInRuleset(this.data)) {
      errors.empty = 'Empty rulesets are not allowed.';
      hasErrors = true;
    }

    this.validateRulesInRuleset(this.data, ruleErrorStore);

    if (ruleErrorStore.length) {
      errors.rules = ruleErrorStore;
      hasErrors = true;
    }
    return hasErrors ? errors : null;
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChangeCallback = () => fn(this.data);
  }
  registerOnTouched(fn: any): void {
    this.onTouchedCallback = () => fn(this.data);
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.changeDetectorRef.detectChanges();
  }

  // ----------END----------

  getDisabledState = (): boolean => {
    return this.disabled;
  };

  findTemplateForRule(rule: Rule): TemplateRef<any> | null {
    const type = this.getInputType(rule.field, rule.operator);
    if (type) {
      const queryInput = this.findQueryInput(type);
      if (queryInput) {
        return queryInput.template;
      } else {
        if (this.defaultTemplateTypes.indexOf(type) === -1) {
          console.warn(`Could not find template for field with type: ${type}`);
        }
        return null;
      }
    } else {
      console.warn('Could not find template for field with null type');
      return null;
    }
  }

  findQueryInput(type: string): QueryInputDirective | undefined {
    const templates = this.parentInputTemplates || this.inputTemplates;
    return templates.find((item) => item.queryInputType === type);
  }

  getOperators(field: string | undefined): string[] {
    if (this.operatorsCache[field ?? '']) {
      return this.operatorsCache[field ?? ''];
    }
    let operators = this.defaultEmptyList;
    const fieldObject = this.config.fields[field ?? ''];

    if (this.config.getOperators) {
      return this.config.getOperators(field ?? '', fieldObject);
    }

    const type = fieldObject.type;

    if (fieldObject && fieldObject.operators) {
      operators = fieldObject.operators;
    } else if (type) {
      operators =
        (this.operatorMap && this.operatorMap[type]) ||
        this.defaultOperatorMap[type] ||
        this.defaultEmptyList;
      if (operators.length === 0) {
        console.warn(
          `No operators found for field '${field}' with type ${fieldObject.type}. ` +
            // eslint-disable-next-line @typescript-eslint/quotes
            "Please define an 'operators' property on the field or use the 'operatorMap' binding to fix this."
        );
      }
      if (fieldObject.nullable) {
        operators = operators.concat(['is null', 'is not null']);
      }
    } else {
      console.warn(`No 'type' property found on field: '${field}'`);
    }

    // Cache reference to array object, so it won't be computed next time and trigger a rerender.
    this.operatorsCache[field ?? ''] = operators;
    return operators;
  }

  getFields(entity: string | undefined): Field[] | undefined {
    if (this.entities && entity) {
      return this.fields?.filter((field) => {
        return field && field.entity === entity;
      });
    } else {
      return this.fields;
    }
  }

  getInputType(
    field: string | null | undefined,
    operator: string | null | undefined
  ): string | null {
    if (this.config.getInputType) {
      return this.config.getInputType(field, operator);
    }

    if (!this.config.fields[field ?? '']) {
      throw new Error(
        `No configuration for field '${field}' could be found! Please add it to config.fields.`
      );
    }

    const type = this.config.fields[field ?? ''].type;
    switch (operator) {
      case 'is null':
      case 'is not null':
        return null; // No displayed component
      case 'in':
      case 'not in':
        return type === 'category' || type === 'boolean' ? 'multiselect' : type;
      default:
        return type;
    }
  }

  getOptions(field: string | undefined): Option[] {
    if (this.config.getOptions) {
      return this.config.getOptions(field ?? '');
    }
    return this.config.fields[field ?? ''].options || this.defaultEmptyList;
  }

  getClassNames(...args: (keyof QueryBuilderClassNames | null)[]): string | null {
    const clsLookup: QueryBuilderClassNames = this.classNames ?? this.defaultClassNames;
    const classNames = args
      .map(
        (id) =>
          clsLookup[id as keyof QueryBuilderClassNames] ??
          this.defaultClassNames[id as keyof QueryBuilderClassNames]
      )
      .filter((c) => !!c);
    return classNames.length ? classNames.join(' ') : null;
  }

  getDefaultField(entity: Entity | undefined): Field | null {
    if (!entity) {
      return null;
    } else if (entity.defaultField !== undefined) {
      return this.getDefaultValue(entity.defaultField);
    } else {
      if (this.fields) {
        const entityFields = this.fields.filter((field) => {
          return field && field.entity === entity.value;
        });
        if (entityFields && entityFields.length) {
          return entityFields[0];
        }
      }
      console.warn(
        `No fields found for entity '${entity.name}'. ` +
          // eslint-disable-next-line @typescript-eslint/quotes
          "A 'defaultOperator' is also not specified on the field config. Operator value will default to null."
      );
      return null;
    }
  }

  getDefaultOperator(field: Field | undefined): string | null {
    if (field && field.defaultOperator !== undefined) {
      return this.getDefaultValue(field.defaultOperator);
    } else {
      const operators = this.getOperators(field?.value ?? '');
      if (operators && operators.length) {
        return operators[0];
      } else {
        console.warn(
          `No operators found for field '${field?.value ?? '<undefined>'}'. ` +
            // eslint-disable-next-line @typescript-eslint/quotes
            "A 'defaultOperator' is also not specified on the field config. Operator value will default to null."
        );
        return null;
      }
    }
  }

  addRule(parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    if (this.config.addRule) {
      this.config.addRule(parent);
    } else {
      const fields: Field[] | undefined = this.getFields(parent?.entity);
      const field = fields?.[0] ?? undefined;
      parent.rules = parent.rules.concat([
        {
          entity: field?.entity,
          field: field?.value,
          operator: this.getDefaultOperator(field),
          value: this.getDefaultValue(field?.defaultValue),
        },
      ]);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  removeRule(rule: Rule, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    parent = parent || this.data;
    if (this.config.removeRule) {
      this.config.removeRule(rule, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== rule);
    }
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.removeButtonContextCache.delete(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  addRuleSet(parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    if (this.ruleSetLevel === 0) {
      const filteredEntities = this.getFilteredEntityList(this.data, this.entities);

      if (filteredEntities?.length ?? 0 > 0) {
        let entity: Entity | undefined;
        const data: EntitySelectorDialogData = {
          heading: 'Add Rule Set',
          entities: filteredEntities ?? [],
        };

        const dialogRef = this.matDialog.open<
          EntitySelectorDialogComponent,
          EntitySelectorDialogData,
          EntitySelectorDialogResponse
        >(EntitySelectorDialogComponent, {
          maxWidth: 700,
          data,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result?.result) {
            const selectedEntity = result.selectedEntity;
            if (selectedEntity) {
              entity = selectedEntity;
            }
            this.addRuleSetInternal(parent, entity?.name);

            this.isRuleSetAvailable = this.ruleSetAvailable();
          }
        });
      }
    } else {
      this.addRuleSetInternal(parent, parent?.entity);
    }
  }

  removeRuleSet(ruleset?: RuleSet, parent?: RuleSet): void {
    if (this.disabled) {
      return;
    }

    ruleset = ruleset || this.data;
    parent = parent || this.parentValue;
    if (this.config.removeRuleSet) {
      this.config.removeRuleSet(ruleset, parent);
    } else {
      parent.rules = parent.rules.filter((r) => r !== ruleset);
    }
    this.handleTouched();
    this.handleDataChange();

    this.removeRuleSetEvent.emit();
  }

  transitionEnd(_: Event): void {
    this.treeContainer.nativeElement.style.maxHeight = null;
  }

  toggleCollapse(): void {
    this.computedTreeContainerHeight();
    setTimeout(() => {
      this.data.collapsed = !this.data.collapsed;
    }, 100);
  }

  computedTreeContainerHeight(): void {
    const nativeElement: HTMLElement = this.treeContainer.nativeElement;
    if (nativeElement && nativeElement.firstElementChild) {
      nativeElement.style.maxHeight = `${nativeElement.firstElementChild.clientHeight + 8}px`;
    }
  }

  changeCondition(value: string): void {
    if (this.disabled) {
      return;
    }

    this.data.condition = value;
    this.handleTouched();
    this.handleDataChange();
  }

  changeOperator(rule: Rule): void {
    if (this.disabled) {
      return;
    }

    if (this.config.coerceValueForOperator) {
      rule.value = this.config.coerceValueForOperator(rule.operator, rule.value, rule);
    } else {
      rule.value = this.coerceValueForOperator(rule.operator, rule.value, rule);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  coerceValueForOperator(operator: string | null | undefined, value: any, rule: Rule): any {
    const inputType: string | null = this.getInputType(rule.field, operator);
    if (inputType === 'multiselect' && !Array.isArray(value)) {
      return [value];
    }
    return value;
  }

  changeInput(): void {
    if (this.disabled) {
      return;
    }

    this.handleTouched();
    this.handleDataChange();
  }

  changeField(fieldValue: string | undefined, rule: Rule): void {
    if (this.disabled) {
      return;
    }

    const inputContext = this.inputContextCache.get(rule);
    const currentField = inputContext && inputContext.field;

    const nextField: Field = this.config.fields[fieldValue ?? ''];

    const nextValue = this.calculateFieldChangeValue(currentField, nextField, rule.value);

    if (nextValue !== undefined) {
      rule.value = nextValue;
    } else {
      delete rule.value;
    }

    rule.operator = this.getDefaultOperator(nextField);

    // Create new context objects so templates will automatically update
    this.inputContextCache.delete(rule);
    this.operatorContextCache.delete(rule);
    this.fieldContextCache.delete(rule);
    this.entityContextCache.delete(rule);
    this.getInputContext(rule);
    this.getFieldContext(rule);
    this.getOperatorContext(rule);
    this.getEntityContext(rule);

    this.handleTouched();
    this.handleDataChange();
  }

  changeEntity(
    entityValue: string,
    rule: Rule,
    index: number | undefined,
    data: RuleSet | undefined
  ): void {
    if (this.disabled) {
      return;
    }
    let i = index;
    let rs = data;
    const entity: Entity | undefined = this.entities?.find((e) => e?.value === entityValue);
    const defaultField: Field | null = this.getDefaultField(entity);
    if (!rs) {
      rs = this.data;
      i = rs.rules.findIndex((x) => x === rule);
    }
    rule.field = defaultField?.value;
    if (i) {
      rs.rules[i] = rule;
    }
    if (defaultField) {
      this.changeField(defaultField.value, rule);
    } else {
      this.handleTouched();
      this.handleDataChange();
    }
  }

  changeConnective(): void {
    this.handleTouched();
    this.handleDataChange();
  }

  getDefaultValue(defaultValue: any): any {
    switch (typeof defaultValue) {
      case 'function':
        return defaultValue();
      default:
        return defaultValue;
    }
  }

  getOperatorTemplate(): TemplateRef<any> | null {
    const t = this.parentOperatorTemplate || this.operatorTemplate;
    return t ? t.template : null;
  }

  getFieldTemplate(): TemplateRef<any> | null {
    const t = this.parentFieldTemplate || this.fieldTemplate;
    return t ? t.template : null;
  }

  getEntityTemplate(): TemplateRef<any> | null {
    const t = this.parentEntityTemplate || this.entityTemplate;
    return t ? t.template : null;
  }

  getArrowIconTemplate(): TemplateRef<any> | null {
    const t = this.parentArrowIconTemplate || this.arrowIconTemplate;
    return t ? t.template : null;
  }

  getButtonGroupTemplate(): TemplateRef<any> | null {
    const t = this.parentButtonGroupTemplate || this.buttonGroupTemplate;
    return t ? t.template : null;
  }

  getSwitchGroupTemplate(): TemplateRef<any> | null {
    const t = this.parentSwitchGroupTemplate || this.switchGroupTemplate;
    return t ? t.template : null;
  }

  getRemoveButtonTemplate(): TemplateRef<any> | null {
    const t = this.parentRemoveButtonTemplate || this.removeButtonTemplate;
    return t ? t.template : null;
  }

  getEmptyWarningTemplate(): TemplateRef<any> | null {
    const t = this.parentEmptyWarningTemplate || this.emptyWarningTemplate;
    return t ? t.template : null;
  }

  getQueryItemClassName(local: LocalRuleMeta): string | null {
    let cls = this.getClassNames('row', 'connector', 'transition');
    cls += ' ' + (this.getClassNames(local.ruleset ? 'ruleSet' : 'rule') ?? '');
    if (local.invalid) {
      cls += ' ' + (this.getClassNames('invalidRuleSet') ?? '');
    }
    return cls;
  }

  getButtonGroupContext(): ButtonGroupContext {
    if (!this.buttonGroupContext) {
      this.buttonGroupContext = {
        addRule: this.addRule.bind(this),
        addRuleSet: this.allowRuleset ? this.addRuleSet.bind(this) : undefined,
        removeRuleSet:
          this.allowRuleset && this.parentValue ? this.removeRuleSet.bind(this) : undefined,
        getDisabledState: this.getDisabledState,
        $implicit: this.data,
      };
    }
    return this.buttonGroupContext;
  }

  getRemoveButtonContext(rule: Rule): RemoveButtonContext | null {
    if (!this.removeButtonContextCache.has(rule)) {
      this.removeButtonContextCache.set(rule, {
        removeRule: this.removeRule.bind(this),
        getDisabledState: this.getDisabledState,
        $implicit: rule,
      });
    }
    return this.removeButtonContextCache.get(rule) ?? null;
  }

  getFieldContext(rule: Rule): FieldContext | null {
    if (!this.fieldContextCache.has(rule)) {
      this.fieldContextCache.set(rule, {
        onChange: this.changeField.bind(this),
        getFields: this.getFields.bind(this),
        getDisabledState: this.getDisabledState,
        fields: this.fields,
        $implicit: rule,
      });
    }
    return this.fieldContextCache.get(rule) ?? null;
  }

  getEntityContext(rule: Rule): EntityContext | null {
    if (!this.entityContextCache.has(rule)) {
      this.entityContextCache.set(rule, {
        onChange: (entityValue: string, ruleChange: Rule) => {
          this.changeEntity(entityValue, ruleChange, undefined, undefined);
        },
        getDisabledState: this.getDisabledState,
        entities: this.entities,
        $implicit: rule,
      });
    }
    return this.entityContextCache.get(rule) ?? null;
  }

  getSwitchGroupContext(): SwitchGroupContext {
    return {
      onChange: this.changeCondition.bind(this),
      getDisabledState: this.getDisabledState,
      $implicit: this.data,
    };
  }

  getArrowIconContext(): ArrowIconContext {
    return {
      getDisabledState: this.getDisabledState,
      $implicit: this.data,
    };
  }

  getEmptyWarningContext(): EmptyWarningContext {
    return {
      getDisabledState: this.getDisabledState,
      message: this.emptyMessage,
      $implicit: this.data,
    };
  }

  getOperatorContext(rule: Rule): OperatorContext | null {
    if (!this.operatorContextCache.has(rule)) {
      this.operatorContextCache.set(rule, {
        onChange: this.changeOperator.bind(this, rule),
        getDisabledState: this.getDisabledState,
        operators: this.getOperators(rule.field ?? ''),
        $implicit: rule,
      });
    }
    return this.operatorContextCache.get(rule) ?? null;
  }

  getInputContext(rule: Rule): InputContext | null {
    if (!this.inputContextCache.has(rule)) {
      this.inputContextCache.set(rule, {
        onChange: this.changeInput.bind(this),
        getDisabledState: this.getDisabledState,
        options: this.getOptions(rule.field ?? ''),
        field: this.config.fields[rule.field ?? ''],
        $implicit: rule,
      });
    }
    return this.inputContextCache.get(rule) ?? null;
  }

  extractRule(ruleOrRuleSet: Rule | RuleSet): Rule | undefined {
    if ('rules' in ruleOrRuleSet && Array.isArray(ruleOrRuleSet.rules)) {
      return undefined;
    } else {
      return ruleOrRuleSet as Rule;
    }
  }

  extractRuleSet(ruleOrRuleSet: Rule | RuleSet): RuleSet | undefined {
    if ('rules' in ruleOrRuleSet && Array.isArray(ruleOrRuleSet.rules)) {
      return ruleOrRuleSet as RuleSet;
    } else {
      return undefined;
    }
  }

  ruleSetExists(ruleSet: RuleSet | undefined): boolean {
    return !!ruleSet?.rules ?? false;
  }

  isInvalidRuleSet(ruleSet: RuleSet | undefined, config: QueryBuilderConfig): boolean {
    const invalid = !config.allowEmptyRulesets && ruleSet?.rules && ruleSet.rules.length === 0;
    return invalid ?? false;
  }

  showAddRuleButton(): boolean {
    return !(this.isDataQuery && this.ruleSetLevel === 0) || this.ruleSetLevel > 0;
  }

  showOrRadioButton(): boolean {
    return !(this.isDataQuery && this.ruleSetLevel === 0) || this.ruleSetLevel > 0;
  }

  onRemoveRulesetEvent() {
    if (this.ruleSetLevel === 0) {
      this.isRuleSetAvailable = this.ruleSetAvailable();
    } else {
      this.removeRuleSetEvent.emit();
    }
  }

  getFilteredEntityList(
    data: RuleSet,
    entities?: (Entity | undefined)[] | null
  ): (Entity | undefined)[] | null | undefined {
    const usedEntityNames = this.getDistinctEntities(data);

    // Get the entity here
    const filteredEntities = entities?.filter(
      (entity) => !usedEntityNames.includes(this.dotFormatEntityName(entity?.name))
    );

    return filteredEntities;
  }

  dotFormatEntityName(entityName?: string): string {
    return entityName?.replace(' > ', '.') ?? '';
  }

  arrowFormatEntityName(entityName?: string): string {
    return entityName?.replace('.', ' > ') ?? '';
  }

  isRuleSet(obj: Rule | RuleSet): obj is RuleSet {
    return (obj as RuleSet).rules !== undefined;
  }

  private calculateFieldChangeValue(
    currentField: Field | undefined,
    nextField: Field,
    currentValue: any
  ): any {
    if (this.config.calculateFieldChangeValue != null) {
      return this.config.calculateFieldChangeValue(currentField, nextField, currentValue);
    }

    const canKeepValue = () => {
      if (currentField == null || nextField == null) {
        return false;
      }
      return (
        currentField.type === nextField.type &&
        this.defaultPersistValueTypes.indexOf(currentField.type) !== -1
      );
    };

    if (this.persistValueOnFieldChange && canKeepValue()) {
      return currentValue;
    }

    if (nextField && nextField.defaultValue !== undefined) {
      return this.getDefaultValue(nextField.defaultValue);
    }

    return undefined;
  }

  private checkEmptyRuleInRuleset(ruleset: RuleSet): boolean {
    if (!ruleset || !ruleset.rules || ruleset.rules.length === 0) {
      return true;
    } else {
      return ruleset.rules.some((item: Rule | RuleSet) => {
        if ('condition' in item) {
          // It's a RuleSet
          if (item.rules) {
            return this.checkEmptyRuleInRuleset(item);
          } else {
            return false;
          }
        } else {
          // It's a Rule
          return false;
        }
      });
    }
  }

  private validateRulesInRuleset(ruleset: RuleSet, errorStore: any[]) {
    if (ruleset && ruleset.rules && ruleset.rules.length > 0) {
      ruleset.rules.forEach((item) => {
        if ((item as RuleSet).rules) {
          return this.validateRulesInRuleset(item as RuleSet, errorStore);
        } else if ((item as Rule).field) {
          const field = this.config.fields[(item as Rule).field ?? ''];
          if (field && field.validator) {
            const error = field.validator(item as Rule, ruleset);
            if (error != null) {
              errorStore.push(error);
            }
          }
        }
      });
    }
  }

  private handleDataChange(): void {
    this.changeDetectorRef.markForCheck();
    if (this.onChangeCallback) {
      this.onChangeCallback();
    }
    if (this.parentChangeCallback) {
      this.parentChangeCallback();
    }
  }

  private handleTouched(): void {
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    if (this.parentTouchedCallback) {
      this.parentTouchedCallback();
    }
  }

  private addRuleSetInternal(parent: RuleSet | undefined, entityName?: string) {
    parent = parent || this.data;
    entityName = entityName || parent.entity;
    if (this.config.addRuleSet) {
      this.config.addRuleSet(parent);
    } else {
      parent.rules = parent.rules.concat([
        {
          condition: 'and',
          entity: this.dotFormatEntityName(entityName),
          rules: [],
        },
      ]);
    }

    this.handleTouched();
    this.handleDataChange();
  }

  private ruleSetAvailable(): boolean {
    const filteredEntities = this.getFilteredEntityList(this.data, this.entities);
    return (filteredEntities?.length ?? 0) > 0;
  }

  private getDistinctEntities(data: RuleSet): string[] {
    const entityList: string[] = [];
    const parent: RuleSet = data;

    parent.rules.forEach((ruleOrSet) => {
      if (this.isRuleSet(ruleOrSet)) {
        if (ruleOrSet.entity && !entityList.includes(ruleOrSet.entity)) {
          entityList.push(ruleOrSet.entity);
        }
      }
    });
    return entityList;
  }
}
