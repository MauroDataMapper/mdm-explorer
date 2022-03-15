import { Component, OnInit } from '@angular/core';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(private security: SecurityService) {}

  ngOnInit(): void {}
}
