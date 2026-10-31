import { TestBed } from '@angular/core/testing';

import { FormularioAutomata } from './formulario-automata';

describe('Editor del autómata', () => {
  async function crear() {
    const fixture =
      TestBed.createComponent(FormularioAutomata);

    await fixture.whenStable();

    const host =
      fixture.nativeElement as HTMLElement;

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

    await pulsar('Ejemplo de inventario');

    const emitidos: unknown[] = [];

    fixture.componentInstance
      .analizarSolicitado
      .subscribe(
        (entrada) => emitidos.push(entrada),
      );

    await pulsar('Generar estados');

    expect(
      campo('estados').value,
    ).toContain('q18');

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

    await pulsar('Ejemplo de inventario');

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

    await pulsar('Ejemplo de inventario');

    const anterior =
      campo('estados').value;

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

  it('bloquea los campos durante el análisis y los habilita conservando sus datos', async () => {
    const {
      fixture,
      host,
      campo,
    } = await crear();

    const estados =
      campo('estados').value;

    const emitidos: unknown[] = [];

    fixture.componentInstance
      .analizarSolicitado
      .subscribe(
        (entrada) => emitidos.push(entrada),
      );

    fixture.componentRef.setInput(
      'cargando',
      true,
    );

    await fixture.whenStable();

    expect(
      campo('numero_nodos').disabled,
    ).toBe(true);

    expect(
      campo('estados').disabled,
    ).toBe(true);

    expect(
      campo('alfabeto').disabled,
    ).toBe(true);

    expect(
      campo('cadena').disabled,
    ).toBe(true);

    expect(
      host.querySelector('textarea')!.disabled,
    ).toBe(true);

    for (
      const nombre of [
        'estado_inicial',
        'estados_finales',
        'metodo',
      ]
    ) {
      expect(
        host
          .querySelector(
            `[formcontrolname="${nombre}"]`,
          )
          ?.getAttribute('aria-disabled'),
      ).toBe('true');
    }

    host
      .querySelector('form')!
      .dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true,
        }),
      );

    expect(emitidos).toHaveLength(0);

    fixture.componentRef.setInput(
      'cargando',
      false,
    );

    await fixture.whenStable();

    expect(
      campo('estados').disabled,
    ).toBe(false);

    expect(
      campo('estados').value,
    ).toBe(estados);

    expect(
      host.querySelector('textarea')!.disabled,
    ).toBe(false);

    for (
      const nombre of [
        'estado_inicial',
        'estados_finales',
        'metodo',
      ]
    ) {
      expect(
        host
          .querySelector(
            `[formcontrolname="${nombre}"]`,
          )
          ?.getAttribute('aria-disabled'),
      ).toBe('false');
    }

    host
      .querySelector('form')!
      .dispatchEvent(
        new Event('submit', {
          bubbles: true,
          cancelable: true,
        }),
      );

    expect(emitidos).toEqual([
      expect.objectContaining({
        numero_nodos: 3,
        estados: ['q0', 'q1', 'q2'],
        estado_inicial: 'q0',
        estados_finales: ['q2'],
      }),
    ]);
  });

  it('puede crearse con cargando activo y volver al estado editable', async () => {
    const fixture =
      TestBed.createComponent(FormularioAutomata);

    fixture.componentRef.setInput(
      'cargando',
      true,
    );

    await fixture.whenStable();

    const host =
      fixture.nativeElement as HTMLElement;

    expect(
      host.querySelector<HTMLInputElement>(
        '[formcontrolname="cadena"]',
      )!.disabled,
    ).toBe(true);

    fixture.componentRef.setInput(
      'cargando',
      false,
    );

    await fixture.whenStable();

    expect(
      host.querySelector<HTMLInputElement>(
        '[formcontrolname="cadena"]',
      )!.disabled,
    ).toBe(false);
  });

  it('no produce la advertencia de disabled con formularios reactivos', async () => {
    const advertencias =
      vi.spyOn(console, 'warn');

    try {
      const { fixture } = await crear();

      fixture.componentRef.setInput(
        'cargando',
        true,
      );

      await fixture.whenStable();

      fixture.componentRef.setInput(
        'cargando',
        false,
      );

      await fixture.whenStable();

      const avisosDisabled =
        advertencias.mock.calls.filter(
          (argumentos) =>
            argumentos.some(
              (valor) =>
                typeof valor === 'string' &&
                valor.includes(
                  'disabled attribute with a reactive form directive',
                ),
            ),
        );

      expect(
        avisosDisabled,
      ).toHaveLength(0);
    } finally {
      advertencias.mockRestore();
    }
  });
});