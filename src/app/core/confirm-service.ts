import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { ConfirmComponent, ConfirmData } from '../shared/confirm/confirm.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private theMatDialog: MatDialog) {}

  open(data: ConfirmData, widthPixels: number): MatDialogRef<ConfirmComponent> {
    let dialogProps: MatDialogConfig = {};
    dialogProps.data = data;
    dialogProps.width = `${widthPixels}px`;
    dialogProps.height = 'fit-content';
    return this.theMatDialog.open<ConfirmComponent, ConfirmData>(
      ConfirmComponent,
      dialogProps
    );
  }
}
