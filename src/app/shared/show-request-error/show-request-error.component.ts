import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-show-request-error',
  templateUrl: './show-request-error.component.html',
  styleUrls: ['./show-request-error.component.scss'],
})
export class ShowRequestErrorComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ShowRequestErrorComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      itemName: string;
      itemType: string;
      requestName: string;
      error: string;
    }
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
