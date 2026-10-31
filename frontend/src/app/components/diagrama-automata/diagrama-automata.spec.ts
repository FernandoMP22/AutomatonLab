import type {
  ComponentFixture,
} from '@angular/core/testing';

import { TestBed } from '@angular/core/testing';

import type { ElementDefinition } from 'cytoscape';

import { DiagramaAutomata } from './diagrama-automata';

import type {
  AutomataEntrada,
} from '../../models/automata';

const { crearGrafo } = vi.hoisted(() => ({
  crearGrafo: vi.fn(),
}));

vi.mock('cytoscape', () => ({
  default: crearGrafo,
}));

function crearEntrada(): AutomataEntrada {
  return {
    numero_nodos: 3,

    estados: ['q0', 'q1', 'q2'],

    alfabeto: [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      ...'0123456789',
    ],

    estado_inicial: 'q0',

    estados_finales: ['q2'],

    transiciones: [
      ...['a', 'b', 'c'].map((simbolo) => ({
        origen: 'q0',
        simbolo,
        destinos: ['q1'],
      })),

      ...['d', 'e', 'f', 'g'].map((simbolo) => ({
        origen: 'q1',
        simbolo,
        destinos: ['q2'],
      })),

      ...[...'0123456789'].map((simbolo) => ({
        origen: 'q2',
        simbolo,
        destinos: ['q2'],
      })),
    ],

    cadena: '',

    metodo: 'afnde',
  };
}

describe('Símbolos desplegables del diagrama', () => {
  let fotogramas: FrameRequestCallback[];

  let pulsarFondo: () => void;

  let moverVista: () => void;

  let punto: {
    x: number;
    y: number;
  };

  let pulsarArista: (
    origen: string,
    destino: string,
  ) => void;

  beforeEach(() => {
    fotogramas = [];

    punto = {
      x: 450,
      y: 200,
    };

    crearGrafo.mockReset();

    vi.stubGlobal(
      'requestAnimationFrame',
      (callback: FrameRequestCallback) => {
        fotogramas.push(callback);

        return fotogramas.length;
      },
    );

    vi.stubGlobal(
      'cancelAnimationFrame',
      vi.fn(),
    );

    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}

        disconnect() {}
      },
    );

    const aristas = {
      length: 1,
      first: vi.fn().mockReturnThis(),
      renderedMidpoint: vi.fn(() => punto),
      removeClass: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      addClass: vi.fn().mockReturnThis(),
    };

    const grafo: Record<string, unknown> = {
      edges: () => aristas,

      on: vi.fn(
        (
          evento: string,

          selector:
            | string
            | ((evento: { target: unknown }) => void),

          callback?: (evento: {
            target: {
              data: (clave: string) => string;
            };
          }) => void,
        ) => {
          if (
            typeof selector === 'string' &&
            callback
          ) {
            pulsarArista = (origen, destino) =>
              callback({
                target: {
                  data: (clave) =>
                    clave === 'origen'
                      ? origen
                      : destino,
                },
              });
          } else if (
            typeof selector === 'function' &&
            evento === 'tap'
          ) {
            pulsarFondo = () =>
              selector({
                target: grafo,
              });
          } else if (
            typeof selector === 'function'
          ) {
            moverVista = () =>
              selector({
                target: grafo,
              });
          }
        },
      ),

      destroy: vi.fn(),
      resize: vi.fn(),
      fit: vi.fn(),
      zoom: vi.fn(() => 1),
      center: vi.fn(),
      pan: vi.fn(),
    };

    crearGrafo.mockReturnValue(grafo);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function actualizar(
    fixture: ComponentFixture<DiagramaAutomata>,
    host: HTMLElement,
  ): void {
    fixture.detectChanges();

    const panel =
      host.querySelector('.detalle-transicion');

    if (panel) {
      Object.defineProperties(panel, {
        offsetWidth: {
          value: 280,
          configurable: true,
        },

        offsetHeight: {
          value: 120,
          configurable: true,
        },
      });
    }

    while (fotogramas.length) {
      fotogramas.shift()!(0);
    }

    fixture.detectChanges();
  }

  async function crear() {
    const fixture =
      TestBed.createComponent(DiagramaAutomata);

    fixture.componentRef.setInput(
      'automata',
      crearEntrada(),
    );

    fixture.componentRef.setInput(
      'estadoTrampa',
      'q2',
    );

    await fixture.whenStable();

    const host =
      fixture.nativeElement as HTMLElement;

    Object.defineProperties(
      host.querySelector('.lienzo'),
      {
        clientWidth: {
          value: 900,
          configurable: true,
        },

        clientHeight: {
          value: 360,
          configurable: true,
        },
      },
    );

    while (fotogramas.length) {
      fotogramas.shift()!(0);
    }

    fixture.detectChanges();

    return {
      fixture,
      host,
    };
  }

  it('conserva tres símbolos y compacta las etiquetas de cuatro o más, incluidos bucles', async () => {
    await crear();

    const elementos =
      crearGrafo.mock.calls[0][0]
        .elements as ElementDefinition[];

    const aristas = elementos.filter(
      (elemento) => elemento.data.source,
    );

    expect(
      aristas.find(
        (elemento) =>
          elemento.data['origen'] === 'q0',
      )?.data['label'],
    ).toBe('a, b, c');

    expect(
      aristas.find(
        (elemento) =>
          elemento.data['origen'] === 'q1',
      )?.data['label'],
    ).toBe('4 símbolos ▸');

    expect(
      aristas.find(
        (elemento) =>
          elemento.data['origen'] === 'q2',
      )?.data['label'],
    ).toBe('10 símbolos ▸');

    expect(
      aristas.find(
        (elemento) =>
          elemento.data['origen'] === 'q2',
      )?.classes,
    ).toContain('trampa');
  });

  it('abre el detalle al pulsar una flecha y lo actualiza al pulsar otra', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    expect(
      host.querySelector('h3')?.textContent,
    ).toContain('q1 → q2');

    expect(
      [
        ...host.querySelectorAll(
          '.lista-simbolos li',
        ),
      ].map(
        (elemento) =>
          elemento.textContent?.trim(),
      ),
    ).toEqual(['d', 'e', 'f', 'g']);

    pulsarArista('q2', 'q2');

    actualizar(fixture, host);

    expect(
      host.querySelector('h3')?.textContent,
    ).toContain('q2 → q2');

    expect(
      host.querySelectorAll(
        '.lista-simbolos li',
      ),
    ).toHaveLength(10);

    expect(
      host.querySelector('.detalle-trampa'),
    ).toBeTruthy();
  });

  it('cierra el panel con su botón', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    host
      .querySelector<HTMLButtonElement>(
        '.detalle-transicion button',
      )!
      .click();

    actualizar(fixture, host);

    expect(
      host.querySelector('.detalle-transicion'),
    ).toBeNull();
  });

  it('permite elegir una transición desde una lista accesible', async () => {
    const {
      fixture,
      host,
    } = await crear();

    const selector =
      host.querySelector('select')!;

    selector.value = '1';

    selector.dispatchEvent(
      new Event('change'),
    );

    actualizar(fixture, host);

    expect(
      host.querySelector('h3')?.textContent,
    ).toContain('q2 → q2');

    selector.value = '';

    selector.dispatchEvent(
      new Event('change'),
    );

    actualizar(fixture, host);

    expect(
      host.querySelector('.detalle-transicion'),
    ).toBeNull();
  });

  it('retira el detalle anterior cuando cambia el autómata, aunque su pestaña esté oculta', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    fixture.componentRef.setInput(
      'activo',
      false,
    );

    fixture.componentRef.setInput(
      'automata',
      {
        ...crearEntrada(),
        transiciones: [],
      },
    );

    actualizar(fixture, host);

    expect(
      host.querySelector('.detalle-transicion'),
    ).toBeNull();

    expect(
      host.querySelector('select'),
    ).toBeNull();
  });

  it('coloca el cuadro dentro del lienzo, centrado encima de la etiqueta', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    const panel =
      host.querySelector<HTMLElement>(
        '.marco-lienzo .detalle-transicion',
      )!;

    expect(panel.style.left).toBe('310px');
    expect(panel.style.top).toBe('68px');
    expect(panel.style.visibility).toBe('visible');
  });

  it('reubica el cuadro al mover la vista y lo mantiene dentro de los bordes', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    punto = {
      x: 850,
      y: 300,
    };

    moverVista();

    actualizar(fixture, host);

    const panel =
      host.querySelector<HTMLElement>(
        '.detalle-transicion',
      )!;

    expect(panel.style.left).toBe('612px');
    expect(panel.style.top).toBe('168px');

    punto = {
      x: 20,
      y: 20,
    };

    moverVista();

    actualizar(fixture, host);

    expect(panel.style.left).toBe('8px');
    expect(panel.style.top).toBe('32px');
  });

  it('cierra el cuadro al pulsar el fondo', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    pulsarFondo();

    actualizar(fixture, host);

    expect(
      host.querySelector('.detalle-transicion'),
    ).toBeNull();
  });

  it('permite cerrar con Escape desde el cuadro', async () => {
    const {
      fixture,
      host,
    } = await crear();

    pulsarArista('q1', 'q2');

    actualizar(fixture, host);

    host
      .querySelector(
        '.detalle-transicion button',
      )!
      .dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
        }),
      );

    actualizar(fixture, host);

    expect(
      host.querySelector('.detalle-transicion'),
    ).toBeNull();
  });
});