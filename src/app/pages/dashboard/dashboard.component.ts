import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Participant } from '../../shared/types';
import { ParticipantFormComponent, ParticipantCreate } from '../../shared/participant-form/participant-form.component';
import { ParticipantListComponent } from '../../shared/participant-list/participant-list.component';
import { ApiService } from '../../core/api.service';
import { catchError, forkJoin, of, switchMap, tap, throwError } from 'rxjs';

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
    participants = signal<Participant[]>([]);
    editing = signal<Participant | null>(null);
    private platformId = inject(PLATFORM_ID);
    loading = signal<boolean>(false);

    constructor(private api: ApiService) {}

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadAllParticipants();
        }
    }

    private loadAllParticipants() {
        this.loading.set(true);

        this.api.listEvents().pipe(
            switchMap(events => {
                if (!events || events.length === 0) {
                    return of([]);
                }
                const requests = events.map(event => this.api.listItemsByDate(event.eventDate).pipe(
                    catchError(() => of([]))
                ));
                return forkJoin(requests);
            }),
            tap(allItemsArrays => {
                const allItems = allItemsArrays.flat();
                if (allItems.length === 0) {
                    this.participants.set([]);
                    return;
                }
                const participantsList: Participant[] = [];
                const itemsByDate = allItems.reduce((acc, item) => {
                    const date = (item as any).eventDate;
                    if (!acc[date]) acc[date] = [];
                    acc[date].push(item);
                    return acc;
                }, {} as Record<string, any[]>);
                
                Object.keys(itemsByDate).forEach(date => {
                    const participantsForDate = this.api.mapItemsToParticipants(itemsByDate[date], date);
                    participantsList.push(...participantsForDate);
                });
                
                console.log('Lista de participantes atualizada.', participantsList);
                this.participants.set(participantsList);
            })
        ).subscribe({
            next: () => this.loading.set(false),        
            error: err => {
                console.error('Erro ao carregar participantes:', err);
                this.participants.set([]);
                this.loading.set(false);               
            }
        });
    }

    handleSubmit(participantData: ParticipantCreate, formComp: ParticipantFormComponent) {
        const participantBeingEdited = this.editing();
        if (participantBeingEdited) {
            this.updateParticipant(participantBeingEdited.id, participantData, formComp);
        } else {
            this.createParticipant(participantData, formComp);
        }
    }

   private createParticipant(p: ParticipantCreate, formComp: ParticipantFormComponent) {
        this.api.createFullParticipant(p).subscribe({
            next: () => {
            formComp.displaySuccess('created');
            this.editing.set(null);
            this.loadAllParticipants();
            },
            error: (err) => formComp.displayError(err?.error?.detail || err?.error?.message || 'Erro ao criar.')
        });
    }
    
    private updateParticipant(
        id: string | number,
        dataToUpdate: ParticipantCreate,
        formComp: ParticipantFormComponent
        ) {
        const before = this.editing()!;
        const after = dataToUpdate;

        this.api.updateCollaborator(id, { name: after.name, cpf: after.cpf }).pipe(
            switchMap(() => {
            const beforeMap = new Map((before.items ?? []).map(i => [i.id, i]));
            const afterMap  = new Map((after.items ?? []).map(i => [i.id, i]));

            const deletions = [];
            const renames   = [];
            const additions = [];

            for (const [oldId, oldItem] of beforeMap.entries()) {
                const now = afterMap.get(oldId);
                if (!now) {
                deletions.push(oldId);
                } else if (now.name.trim() !== oldItem.name.trim()) {
                renames.push({ id: oldId, name: now.name.trim() });
                }
            }

            for (const [newId, newItem] of afterMap.entries()) {
                if (!beforeMap.has(newId)) {
                additions.push({ name: newItem.name.trim() });
                }
            }

            const calls = [
                ...deletions.map(id => this.api.deleteItem(id)),
                ...renames.map(r => this.api.updateItem(r.id, { itemName: r.name })),
                ...additions.map(a =>
                this.api.createItem({
                    eventDate: before.breakfastDate,
                    cpf: before.cpf,               
                    itemName: a.name
                })
                )
            ];

            return calls.length ? forkJoin(calls) : of(null);
            })
        ).subscribe({
            next: () => {
            formComp.displaySuccess('updated');
            this.editing.set(null);
            this.loadAllParticipants();
            },
            error: (err) => formComp.displayError(err.error?.message || 'Erro ao atualizar itens.')
        });
    }

    onDelete(collaboratorId: string | number) {
        this.api.deleteCollaborator(collaboratorId).subscribe({
            next: () => {
                console.log('Participante deletado!');
                this.loadAllParticipants();
            },
            error: (err) => alert(err.error?.message || 'Erro ao deletar.')
        });
    }

    onUpdateItem(e: { itemId: string | number; brought: boolean }) {
        this.api.markItem(e.itemId, e.brought).subscribe({
            next: () => this.loadAllParticipants(),
            error: (err) => console.error('Erro ao marcar item:', err)
        });
    }
}