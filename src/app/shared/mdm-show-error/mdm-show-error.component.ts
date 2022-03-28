import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mdm-show-error',
  templateUrl: './mdm-show-error.component.html',
  styleUrls: ['./mdm-show-error.component.scss'],
})
export class MdmShowErrorComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<MdmShowErrorComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      heading: string;
      subHeading: string;
      message: string;
      buttonLabel: string;
    }
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
