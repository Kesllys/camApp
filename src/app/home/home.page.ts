import { Component } from '@angular/core';
import { FotoService } from '../services/foto.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public fotoService: FotoService) {}
  tirarFoto() {
    this.fotoService.tirarFoto();
  }
}
