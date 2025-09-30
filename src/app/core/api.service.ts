import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Participant } from '../shared/types';

interface CreateCollaboratorBody { name: string; cpf: string; }
interface CreateEventBody { eventDate: string; }
interface CreateItemBody { eventDate: string; cpf: string; itemName: string; }

interface ItemDTO {
    id: number | string;
    itemName: string;
    brought: boolean | null;
    eventDate: string;
    collaboratorName?: string;
    collaboratorCpf?: string;
    cpf?: string;
    collaboratorId?: number | string;
    collaborator?: { id?: number | string; name: string; cpf: string };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    private base = environment.apiBase + '/api';
    constructor(private http: HttpClient) {}

    createCollaborator(body: CreateCollaboratorBody): Observable<{ id: string; name: string; cpf: string }> {
        return this.http.post<{ id: string; name: string; cpf: string }>(`${this.base}/collaborators`, body);
    }

    createFullParticipant(payload: {
        name: string;
        cpf: string;
        breakfastDate: string;
        items: { id: string; name: string; brought: boolean }[];
    }) {
        return this.http.post(`${this.base}/participants`, payload);
    }

    updateCollaborator(id: string | number, body: CreateCollaboratorBody): Observable<Participant> {
        return this.http.put<Participant>(`${this.base}/collaborators/${id}`, body);
    }

    deleteCollaborator(collaboratorId: string | number): Observable<void> {
        return this.http.delete<void>(`${this.base}/collaborators/${collaboratorId}`);
    }

    createEvent(body: CreateEventBody): Observable<{ id: string; eventDate: string }> {
        return this.http.post<{ id: string; eventDate: string }>(`${this.base}/events`, body);
    }

    listEvents() {
        return this.http.get<{ id: number; eventDate: string }[]>(
            `${this.base}/events`,
            { params: { _t: Date.now() } as any }
        );
    }

    createItem(body: CreateItemBody): Observable<{ id: string; itemName: string }> {
        return this.http.post<{ id: string; itemName: string }>(`${this.base}/items`, body);
    }

    updateItem(itemId: string | number, body: { itemName: string }): Observable<void> {
        return this.http.put<void>(`${this.base}/items/${itemId}`, body);
    }

    deleteItem(itemId: string | number) {
        return this.http.delete<void>(`${this.base}/items/${itemId}`);
    }

    markItem(itemId: string | number, brought: boolean | null): Observable<{ id: string; brought: boolean }> {
        return this.http.patch<{ id: string; brought: boolean }>(`${this.base}/items/${itemId}/mark`, { brought });
    }

    listItemsByDate(date: string) {
        return this.http.get<ItemDTO[]>(
            `${this.base}/items/by-date/${date}`,
            { params: { _t: Date.now() } as any }
        );
    }

    listAllParticipants(): Observable<Participant[]> {
        return this.http.get<Participant[]>(`${this.base}/participants`);
    }

    mapItemsToParticipants(items: ItemDTO[], date: string): Participant[] {
        const participantsMap = new Map<string, Participant>();

        for (const item of items) {
            const collaboratorId = item.collaborator?.id ?? item.collaboratorId;
            const collaboratorName = item.collaborator?.name ?? item.collaboratorName;
            const collaboratorCpf = item.collaborator?.cpf ?? item.collaboratorCpf ?? item.cpf;

            if (!collaboratorId || !collaboratorName || !collaboratorCpf) {
                console.warn('Item recebido da API sem dados de colaborador COMPLETOS (precisa de ID, Nome e CPF). Ignorando:', item);
                continue;
            }

            const id = String(collaboratorId);

            if (!participantsMap.has(id)) {
                participantsMap.set(id, {
                    id,
                    name: collaboratorName,
                    cpf: collaboratorCpf,
                    breakfastDate: item.eventDate ?? date,
                    items: [],
                });
            }

            const participant = participantsMap.get(id)!;
            participant.items.push({
                id: String(item.id),
                name: item.itemName,
                brought: !!item.brought,
            });
        }

        return Array.from(participantsMap.values());
    }

    fetchAll$(): Observable<{
        events: { id: number; eventDate: string }[];
        itemsByDate: Record<string, ItemDTO[]>;
        participants: Participant[];
    }> {
        return this.listEvents().pipe(
        switchMap(events => {
            if (!events || events.length === 0) {
            return of({ events: [], itemsByDate: {}, participants: [] });
            }

            const calls = events.map(e =>
            this.listItemsByDate(e.eventDate).pipe(catchError(() => of<ItemDTO[]>([])))
            );

            return forkJoin(calls).pipe(
            map(itemsArrays => {
                const itemsByDate: Record<string, ItemDTO[]> = {};
                for (const arr of itemsArrays) {
                    for (const it of arr) {
                        const d = it.eventDate;
                        (itemsByDate[d] ??= []).push(it);
                    }
                }

                const participants: Participant[] = [];
                for (const date of Object.keys(itemsByDate)) {
                    participants.push(...this.mapItemsToParticipants(itemsByDate[date], date));
                }

                participants.sort(
                (a, b) =>
                    a.breakfastDate.localeCompare(b.breakfastDate) ||
                    a.name.localeCompare(b.name)
                );

                return { events, itemsByDate, participants };
                })
                );
            })
        );
    }
}