import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DataClass } from '@maurodatamapper/mdm-resources';

@Component({
  selector: 'mdm-create-request',
  templateUrl: './create-request.component.html',
  styleUrls: ['./create-request.component.scss'],
})
export class CreateRequestComponent implements OnInit {
  public requestName = '';

  constructor(public dialogRef: MatDialogRef<CreateRequestComponent>) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close(this.requestName);
  }
}
