import { Component, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Participant } from '../../shared/types';
import { ParticipantFormComponent, ParticipantCreate } from '../../shared/participant-form/participant-form.component';
import { ParticipantListComponent } from '../../shared/participant-list/participant-list.component';
import { ApiService } from '../../core/api.service';
import { forkJoin, of, switchMap, catchError } from 'rxjs';
import { finalize } from 'rxjs/operators'; // <= garanta este import

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ParticipantFormComponent, ParticipantListComponent],
  template: `
    <div class="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-8 items-start">
      <app-participant-form
        #formComp
        [participant]="editing()"
        (submitParticipant)="handleSubmit($event, formComp)"
        (cancel)="editing.set(null)">
      </app-participant-form>

      <app-participant-list
        [participants]="participants()"
        [loading]="loading()"
        (edit)="editing.set($event)"
        (delete)="onDelete($event)"
        (updateItem)="onUpdateItem($event)">
      </app-participant-list>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  @ViewChild('formComp') formComp!: ParticipantFormComponent;
  
  participants = signal<Participant[]>([]);
  editing = signal<Participant | null>(null);
  loading = signal<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.refresh();
    }
  }

  private refresh() {
    this.loading.set(true);
    this.api.fetchAll$()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ participants }) => this.participants.set(participants),
        error: (err) => {
          console.error('Erro ao carregar tudo:', err);
          this.participants.set([]);
        }
      });
  }

  handleSubmit(data: ParticipantCreate, formComp: ParticipantFormComponent) {
    const editing = this.editing();
    editing ? this.updateParticipant(editing.id, data, formComp) : this.createParticipant(data, formComp);
  }

  private createParticipant(p: ParticipantCreate, formComp: ParticipantFormComponent) {
    this.loading.set(true);
    this.api.createFullParticipant(p)
      .pipe(
        switchMap(() => this.api.fetchAll$()),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: ({ participants }) => {
          this.participants.set(participants);
          this.editing.set(null);
          formComp.displaySuccess('created'); 
        },

        error: (err) =>
          formComp.displayError(err?.error?.detail || err?.error?.message || 'Erro ao criar.')
      });
  }

  private updateParticipant(id: string | number, data: ParticipantCreate, formComp: ParticipantFormComponent) {
    const before = this.editing()!;
    const after  = data;

    const beforeMap = new Map((before.items ?? []).map(i => [i.id, i]));
    const afterMap  = new Map((after.items ?? []).map(i => [i.id, i]));

    const deletions: (string | number)[] = [];
    const renames: { id: string | number; itemName: string }[] = [];
    const additions: { itemName: string }[] = [];

    for (const [oldId, oldItem] of beforeMap.entries()) {
      const now = afterMap.get(oldId);
      if (!now) deletions.push(oldId);
      else if (now.name.trim() !== oldItem.name.trim()) renames.push({ id: oldId, itemName: now.name.trim() });
    }
    for (const [newId, newItem] of afterMap.entries()) {
      if (!beforeMap.has(newId)) additions.push({ itemName: newItem.name.trim() });
    }

    const calls = [
      ...deletions.map(id => this.api.deleteItem(id)),
      ...renames.map(r => this.api.updateItem(r.id, { itemName: r.itemName })),
      ...additions.map(a => this.api.createItem({ eventDate: before.breakfastDate, cpf: before.cpf, itemName: a.itemName }))
    ];

    this.loading.set(true);
    this.api.updateCollaborator(id, { name: after.name, cpf: after.cpf })
    .pipe(
      switchMap(() => calls.length ? forkJoin(calls) : of(null)),
      switchMap(() => this.api.fetchAll$()),
      finalize(() => this.loading.set(false))
    )
    .subscribe({
      next: ({ participants }) => {
        this.participants.set(participants);
        this.editing.set(null);
        formComp.displaySuccess('updated');
      },

      error: (err) =>
        formComp.displayError(err?.error?.message || 'Erro ao atualizar itens.')
    });
  }

  onDelete(collaboratorId: string | number) {
    this.loading.set(true);
    this.api.deleteCollaborator(collaboratorId)
    .pipe(
      switchMap(() => this.api.fetchAll$()),
      finalize(() => this.loading.set(false))
    )
    .subscribe({
      next: ({ participants }) => {
          this.participants.set(participants);
          this.formComp.displaySuccess('deleted');
      },
      error: (err) => this.formComp.displayError(err?.error?.message || 'Erro ao deletar.')
    });
  }

  onUpdateItem(e: { itemId: string | number; brought: boolean }) {
    this.loading.set(true);
    this.api.markItem(e.itemId, e.brought)
    .pipe(
      switchMap(() => this.api.fetchAll$()),
      finalize(() => this.loading.set(false))
    )
    .subscribe({
      next: ({ participants }) => this.participants.set(participants),
      error: (err) => console.error('Erro ao marcar item:', err)
    });
  }
}