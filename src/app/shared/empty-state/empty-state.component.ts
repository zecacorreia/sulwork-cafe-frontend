import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  @Input() icon = 'calendar';
  @Input() title = 'Nenhum café agendado';
  @Input() message = 'Adicione o primeiro participante para começar a organizar os cafés da manhã.';
}