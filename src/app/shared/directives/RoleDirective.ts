import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnInit {
  @Input('appRole') role!: string;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userRole = this.authService.getUserRole(); // Método que retorna o papel do usuário logado
    if (userRole !== this.role) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
