import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtividadeComponent } from './atividades.component';

describe('AtividadeComponent', () => {
  let component: AtividadeComponent;
  let fixture: ComponentFixture<AtividadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtividadeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtividadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
