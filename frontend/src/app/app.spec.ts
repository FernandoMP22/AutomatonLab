import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTabGroupHarness } from '@angular/material/tabs/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { App } from './app';
import type { ResultadoAnalisis } from './models/automata';

function respuesta(metodo: 'afd' | 'afnde'): ResultadoAnalisis {
  return {
    cadena: 'PED-1234',
    metodo,
    aceptada: true,
    afd:
      metodo === 'afd'
        ? {
            estados: [
              { id: 'D0', componentes: ['q0', 'q1', 'q5', 'q9'] },
              { id: 'D1', componentes: ['q18'] },
            ],
            alfabeto: ['P'],
            estado_inicial: 'D0',
            estados_finales: ['D1'],
            transiciones: [],
            estado_trampa: null,
          }
        : null,
    recorrido_afd:
      metodo === 'afd'
        ? [
            { posicion: 0, simbolo: null, estado: 'D0' },
            { posicion: 8, simbolo: '4', estado: 'D1' },
          ]
        : null,
    recorrido_afnde:
      metodo === 'afnde'
        ? [
            { posicion: 0, simbolo: null, estados: ['q0', 'q1', 'q5', 'q9'] },
            { posicion: 8, simbolo: '4', estados: ['q18'] },
          ]
        : null,
  };
}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
      // El grafo se comprueba aparte; estas pruebas verifican el flujo de la pantalla.
      deferBlockBehavior: DeferBlockBehavior.Manual,
    }).compileComponents();
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  async function crear() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const pestañas = await loader.getHarness(MatTabGroupHarness);
    const pulsar = async (texto: string) => {
      const boton = [...host.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.includes(texto),
      );
      expect(boton).toBeTruthy();
      boton!.click();
      await fixture.whenStable();
    };
    return { fixture, host, pestañas, pulsar, loader };
  }

  it('muestra configuración y tabla en el editor, con el botón en configuración', async () => {
    const { host, pestañas } = await crear();
    expect(host.querySelector('h1')?.textContent).toContain('AutomatonLab');
    expect(await (await pestañas.getSelectedTab()).getLabel()).toBe('Editor del autómata');
    expect(host.querySelector('.area-trabajo .transiciones table')).toBeTruthy();
    expect(
      host.querySelector('app-formulario-automata button[type="submit"]')?.textContent,
    ).toContain('Analizar cadena');
    expect(host.querySelector('.transiciones button[type="submit"]')).toBeNull();
  });

  for (const metodo of ['afd', 'afnde'] as const) {
    it(`abre análisis tras una respuesta correcta y muestra el recorrido ${metodo}`, async () => {
      const { fixture, host, pestañas, pulsar, loader } = await crear();
      await pulsar('Ejemplo de inventario');
      if (metodo === 'afnde') {
        const selector = await loader.getHarness(
          MatSelectHarness.with({ selector: '[formcontrolname="metodo"]' }),
        );
        await selector.open();
        await selector.clickOptions({ text: 'Simular AFND-ε' });
      }
      await pulsar('Analizar cadena');
      const solicitud = TestBed.inject(HttpTestingController).expectOne(
        'http://127.0.0.1:8000/automatas/analizar',
      );
      expect(solicitud.request.body.numero_nodos).toBe(19);
      expect(solicitud.request.body.metodo).toBe(metodo);
      solicitud.flush(respuesta(metodo));
      await fixture.whenStable();
      expect(await (await pestañas.getSelectedTab()).getLabel()).toBe('Diagramas y análisis');
      expect(host.querySelector('.resultado')?.textContent).toContain('Cadena aceptada');
      expect(host.querySelector('.recorrido tbody')?.textContent).toContain(
        metodo === 'afd' ? 'D1' : 'q18',
      );
      await pestañas.selectTab({ label: 'Editor del autómata' });
      expect(host.querySelector<HTMLInputElement>('[formcontrolname="cadena"]')!.value).toBe(
        'PED-1234',
      );
      await pulsar('Borrar configuración');
      expect(host.querySelector<HTMLInputElement>('[formcontrolname="estados"]')!.value).toBe('');
      await pestañas.selectTab({ label: 'Diagramas y análisis' });
      expect(host.querySelector('.resultado')?.textContent).not.toContain('Cadena aceptada');
    });
  }

  it('mantiene el editor y presenta el error de conexión junto a configuración', async () => {
    const { host, pestañas, pulsar } = await crear();
    await pulsar('Ejemplo de inventario');
    await pulsar('Analizar cadena');
    TestBed.inject(HttpTestingController)
      .expectOne('http://127.0.0.1:8000/automatas/analizar')
      .error(new ProgressEvent('error'));
    expect(await (await pestañas.getSelectedTab()).getLabel()).toBe('Editor del autómata');
    expect(host.querySelector('app-formulario-automata [role="alert"]')?.textContent).toContain(
      'No se pudo conectar',
    );
  });

  it('una configuración inválida no envía una solicitud', async () => {
    const { pestañas, pulsar } = await crear();
    await pulsar('Borrar configuración');
    await pulsar('Analizar cadena');
    TestBed.inject(HttpTestingController).expectNone('http://127.0.0.1:8000/automatas/analizar');
    expect(await (await pestañas.getSelectedTab()).getLabel()).toBe('Editor del autómata');
  });
});
