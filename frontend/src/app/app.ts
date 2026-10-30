import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FormularioAutomata } from './components/formulario-automata/formulario-automata';

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatToolbarModule,
    FormularioAutomata,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly titulo = 'AutomatonLab';
}