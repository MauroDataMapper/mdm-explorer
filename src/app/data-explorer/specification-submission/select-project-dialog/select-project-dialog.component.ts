import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Uuid } from '@maurodatamapper/sde-resources';

export interface SelectProjectDialogData {
  specificationId: Uuid;
}

@Component({
  selector: 'mdm-select-project-dialog',
  templateUrl: './select-project-dialog.component.html',
  styleUrls: ['./select-project-dialog.component.scss'],
})
export class SelectProjectDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<SelectProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SelectProjectDialogData
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
