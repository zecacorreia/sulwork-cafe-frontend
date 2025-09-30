import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Participant, BreakfastItem } from '../types';

@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './participant-card.component.html'
})
export class ParticipantCardComponent {
  @Input({ required: true }) participant!: Participant;
  @Input({ required: true }) date!: string;

  @Output() edit = new EventEmitter<Participant>();
  @Output() delete = new EventEmitter<{ id: string; name: string }>();
  @Output() updateItem = new EventEmitter<{ participantId: string; itemId: string; brought: boolean }>();

  private today = new Date();
  private todayStr = new Date(this.today.getTime() - this.today.getTimezoneOffset()*60000).toISOString().split('T')[0];

  isToday = (date: string) => date === this.todayStr;
  isPast  = (date: string) => date < this.todayStr;

  onEdit() {
    this.edit.emit(this.participant);
  }

  onDelete() {
    this.delete.emit({ id: this.participant.id, name: this.participant.name });
  }

  onItemToggle(itemId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    this.updateItem.emit({ participantId: this.participant.id, itemId, brought: input.checked });
  }

  trackItem = (_: number, it: BreakfastItem) => it.id;
}