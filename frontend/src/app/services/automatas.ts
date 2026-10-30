import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import type {
  AutomataEntrada,
  ResultadoAnalisis,
} from '../models/automata';

@Injectable({
  providedIn: 'root',
})
export class AutomatasService {
  private readonly http = inject(HttpClient);

  private readonly urlAnalisis =
    'http://127.0.0.1:8000/automatas/analizar';

  analizar(entrada: AutomataEntrada): Observable<ResultadoAnalisis> {
    return this.http.post<ResultadoAnalisis>(
      this.urlAnalisis,
      entrada,
    );
  }
}