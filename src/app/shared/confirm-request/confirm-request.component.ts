import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-confirm-request',
  templateUrl: './confirm-request.component.html',
  styleUrls: ['./confirm-request.component.scss'],
})
export class ConfirmRequestComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmRequestComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { itemName: string; itemType: string; requestName: string }
  ) {}

  ngOnInit(): void {}

  viewRequests() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
