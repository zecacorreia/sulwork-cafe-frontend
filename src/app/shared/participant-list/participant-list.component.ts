import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Participant, BreakfastItem } from '../types';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './participant-list.component.html'
})
export class ParticipantListComponent {
    @Input({ required: true }) participants: Participant[] = [];
    @Input() loading = false;

    @Output() edit = new EventEmitter<Participant>();
    @Output() delete = new EventEmitter<string>();
    @Output() updateItem = new EventEmitter<{ participantId: string; itemId: string; brought: boolean }>();

  // data de hoje “fixada” à meia-noite e em formato ISO local (YYYY-MM-DD)
  private toIsoLocal(d: Date) { return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().split('T')[0]; }
  private today = new Date();
  private todayStr = this.toIsoLocal(new Date(this.today.setHours(0,0,0,0)));

  isToday = (date: string) => date === this.todayStr;
  isPast  = (date: string) => date < this.todayStr;

  // ✅ getters recalculam com base no @Input sempre que o Angular reavalia o template
  get grouped(): Record<string, Participant[]> {
    const groups: Record<string, Participant[]> = {};
    for (const p of this.participants ?? []) {
      const d = p.breakfastDate;
      (groups[d] ??= []).push(p);
    }
    return groups;
  }

  get sortedDates(): string[] {
    return Object.keys(this.grouped).sort();
  }

  groupFor(date: string) { return this.grouped[date] ?? []; }

  formatDate(dateString: string) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  getDateStatusBg(date: string) {
    if (this.isToday(date)) return { icon: 'clock' as const, color: 'bg-indigo-600', label: 'Hoje' };
    if (this.isPast(date))  return { icon: 'x-circle' as const, color: 'bg-zinc-500', label: 'Passou' };
    return { icon: 'calendar' as const, color: 'bg-emerald-700', label: 'Futuro' };
  }

  getDateStatus(date: string) {
    if (this.isToday(date)) return { icon: 'clock' as const, color: 'text-indigo-600', label: 'Hoje' };
    if (this.isPast(date))  return { icon: 'x-circle' as const, color: 'text-zinc-500', label: 'Passou' };
    return { icon: 'calendar' as const, color: 'text-emerald-700', label: 'Futuro' };
  }

  onEdit(p: Participant) { this.edit.emit(p); }
  onDelete(id: string, name: string) {
    const ok = confirm(`Remover ${name}? Esta ação não pode ser desfeita.`);
    if (ok) this.delete.emit(id);
  }
  onItemToggle(participantId: string, itemId: string, checked: boolean) {
    this.updateItem.emit({ participantId, itemId, brought: checked });
  }

  trackDate = (_: number, d: string) => d;
  trackParticipant = (_: number, p: Participant) => p.id;
  trackItem = (_: number, it: BreakfastItem) => it.id;
}
