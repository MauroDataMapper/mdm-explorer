import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
  MdmShowErrorComponent,
  ShowErrorData,
} from '../shared/mdm-show-error/mdm-show-error.component';

@Injectable({
  providedIn: 'root',
})
export class MdmShowErrorService {
  constructor(private theMatDialog: MatDialog) {}

  open(data: ShowErrorData, widthPixels: number): MatDialogRef<MdmShowErrorComponent> {
    let dialogProps: MatDialogConfig = {};
    dialogProps.data = data;
    dialogProps.width = `${widthPixels}px`;
    dialogProps.height = 'fit-content';
    return this.theMatDialog.open<MdmShowErrorComponent, ShowErrorData>(
      MdmShowErrorComponent,
      dialogProps
    );
  }
}
