import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Calendar, Edit3, Trash2, User, CheckCircle, XCircle, Clock } from 'lucide-angular';
import { Participant, BreakfastItem } from '../types';

@Component({
    selector: 'app-participant-list',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './participant-list.component.html'
})

export class ParticipantListComponent {
    @Input({ required: true }) participants: Participant[] = [];

    @Output() edit = new EventEmitter<Participant>();
    @Output() delete = new EventEmitter<string>();
    @Output() updateItem = new EventEmitter<{ participantId: string; itemId: string; brought: boolean }>();

    today = new Date().toISOString().split('T')[0];

    private grouped = computed(() => {
        const groups: Record<string, Participant[]> = {};
        for (const p of this.participants) {
        const d = p.breakfastDate;
        (groups[d] ??= []).push(p);
        }
        return groups;
    });

    sortedDates = computed(() => Object.keys(this.grouped()).sort());

    isToday = (date: string) => date === this.today;
    isPast  = (date: string) => date < this.today;

    formatDate(dateString: string) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
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

    groupFor(date: string) { return this.grouped()[date] ?? []; }
    trackDate(_i: number, d: string) { return d; }
    trackParticipant(_i: number, p: Participant) { return p.id; }
    trackItem(_i: number, it: BreakfastItem) { return it.id; }
}