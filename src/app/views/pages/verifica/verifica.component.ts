import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verifica',
  imports: [],
  templateUrl: './verifica.component.html',
  styleUrl: './verifica.component.scss'
})
export class VerificaComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log(token)

  }
}
