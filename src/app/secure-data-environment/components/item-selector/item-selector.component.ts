import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Uuid } from '@maurodatamapper/sde-resources';

export interface SelectableOption {
  id: Uuid;
  displayName: string;
}

@Component({
  selector: 'mdm-item-selector',
  templateUrl: './item-selector.component.html',
  styleUrls: ['./item-selector.component.scss'],
})
export class ItemSelectorComponent implements OnInit {
  @Input() label = '';
  @Input() options: SelectableOption[] | null = [];

  @Output() selectionChanged = new EventEmitter<SelectableOption>();

  selectedOption: SelectableOption = { id: '', displayName: '' };

  constructor() { }

  ngOnInit(): void { }

  onSelect(event: MatSelectChange) {
    console.log(event.value);
    this.selectionChanged.emit(event.value as SelectableOption);
  }
}
