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
  public requestDescription = '';

  constructor(public dialogRef: MatDialogRef<CreateRequestComponent>) {}

  ngOnInit(): void {}

  cancel() {
    let result = new NewRequestDialogResult();
    this.dialogRef.close(result);
  }

  close() {
    let result = {
      Name: this.requestName,
      Description: this.requestDescription,
    };
    this.dialogRef.close(result);
  }
}

export class NewRequestDialogResult {
  Name: string = '';
  Description: string = '';
}
