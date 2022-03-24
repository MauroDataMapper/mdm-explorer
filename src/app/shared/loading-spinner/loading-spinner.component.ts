import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mdm-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() color: string = 'primary';
  @Input() diameter: number = 50;
  @Input() caption: string = 'Loading ...';

  constructor() {}

  ngOnInit(): void {}
}
