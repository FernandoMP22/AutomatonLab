import { TestBed } from '@angular/core/testing';

import { FormularioAutomata } from './formulario-automata';

describe('Editor del autómata', () => {
  async function crear() {
    const fixture =
      TestBed.createComponent(FormularioAutomata);

    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;

    const pulsar = async (texto: string) => {
      const boton = [
        ...host.querySelectorAll('button'),
      ].find(
        (elemento) =>
          elemento.textContent?.includes(texto),
      );

      expect(boton).toBeTruthy();

      boton!.click();

      await fixture.whenStable();
    };

    const campo = (nombre: string) =>
      host.querySelector<HTMLInputElement>(
        `input[formcontrolname="${nombre}"]`,
      )!;

    return {
      fixture,
      host,
      pulsar,
      campo,
    };
  }

  it('genera nombres sin conservar transiciones ni finales del ejemplo', async () => {
    const {
      fixture,
      pulsar,
      campo,
    } = await crear();

    await pulsar('Ejemplo de 10 estados');

    const emitidos: unknown[] = [];

    fixture.componentInstance
      .analizarSolicitado
      .subscribe(
        (entrada) => emitidos.push(entrada),
      );

    await pulsar('Generar estados');

    expect(
      campo('estados').value,
    ).toContain('q9');

    const formulario =
      fixture.nativeElement.querySelector('form');

    formulario.dispatchEvent(
      new Event('submit', {
        bubbles: true,
        cancelable: true,
      }),
    );

    expect(emitidos).toEqual([
      expect.objectContaining({
        transiciones: [],
        estados_finales: [],
        estado_inicial: 'q0',
      }),
    ]);
  });

  it('borra campos, JSON y solicita retirar el análisis anterior', async () => {
    const {
      fixture,
      pulsar,
      campo,
      host,
    } = await crear();

    await pulsar('Ejemplo de 10 estados');

    let borrados = 0;

    fixture.componentInstance
      .configuracionBorrada
      .subscribe(() => {
        borrados++;
      });

    await pulsar('Borrar configuración');

    expect(
      campo('numero_nodos').value,
    ).toBe('');

    expect(
      campo('estados').value,
    ).toBe('');

    expect(
      campo('alfabeto').value,
    ).toBe('');

    expect(
      host.querySelector('textarea')!.value,
    ).toBe('');

    expect(borrados).toBe(1);
  });

  it('un JSON incorrecto conserva la configuración y muestra el error', async () => {
    const {
      pulsar,
      campo,
      host,
    } = await crear();

    await pulsar('Ejemplo de 10 estados');

    const anterior = campo('estados').value;

    const area =
      host.querySelector('textarea')!;

    area.value = '{';

    area.dispatchEvent(
      new Event('input'),
    );

    await pulsar('Cargar en el formulario');

    expect(
      campo('estados').value,
    ).toBe(anterior);

    expect(
      host.querySelector('[role="alert"]')?.textContent,
    ).toContain('JSON válido');
  });
});