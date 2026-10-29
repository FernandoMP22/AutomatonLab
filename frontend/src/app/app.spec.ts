import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('debe crear la aplicación', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debe mostrar el título principal', async () => {
    const fixture = TestBed.createComponent(App);

    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    const titulo = elemento.querySelector('h1');

    expect(titulo?.textContent).toContain('AutomatonLab');
  });
});