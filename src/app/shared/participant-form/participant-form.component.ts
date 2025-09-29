import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { Participant, BreakfastItem } from '../types';

export type ParticipantCreate = Omit<Participant, 'id'>;

@Component({
    selector: 'app-participant-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './participant-form.component.html'
})
export class ParticipantFormComponent implements OnChanges {
    @Input() participant: Participant | null = null;
    @Output() submitParticipant = new EventEmitter<ParticipantCreate>();
    @Output() cancel = new EventEmitter<void>();

    newItem = new FormControl<string>('', { nonNullable: true });
    successMessage = signal<string>(''); 
    errorMessage = signal<string>(''); 
    form: FormGroup;
    isEditing = computed(() => !!this.participant);

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name: [''],
            cpf: [{ value: '', disabled: true }],
            breakfastDate: [{ value: '', disabled: true }],
            items: this.fb.array<FormGroup>([])
        });
        this.form.get('name')?.setValidators([Validators.required, Validators.minLength(2)]);
        this.form.get('cpf')?.setValidators([Validators.required, this.cpfValidator]);
        this.form.get('breakfastDate')?.setValidators([Validators.required, this.futureDateValidator]);
    }

    get items(): FormArray<FormGroup> {
        return this.form.get('items') as FormArray<FormGroup>;
    }

    private makeItemGroup(item?: BreakfastItem): FormGroup {
        return this.fb.group({
            id: [item?.id ?? crypto.randomUUID()],
            name: [item?.name ?? '', [Validators.required, Validators.minLength(2)]],
            brought: [item?.brought ?? false]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['participant']) return;

        if (this.participant) {
            this.successMessage.set('');
            this.errorMessage.set('');

            this.items.clear();
            this.form.patchValue({
            name: this.participant.name ?? '',
            cpf: this.participant.cpf ?? '',
            breakfastDate: this.participant.breakfastDate ?? ''
            });
            this.form.get('name')?.enable();
            this.form.get('cpf')?.disable();
            this.form.get('breakfastDate')?.disable();
            (this.participant.items ?? []).forEach(i => this.items.push(this.makeItemGroup(i)));
        } else {
            this.errorMessage.set('');
            this.form.reset();
            this.items.clear();
            this.newItem.setValue('');
            this.form.get('name')?.enable();
            this.form.get('cpf')?.enable();
            this.form.get('breakfastDate')?.enable();
        }
    }

    private cpfValidator = (control: AbstractControl): ValidationErrors | null => {
        const value = control.value as string; 
        const cleaned = (value ?? '').replace(/\D/g, '');
        return /^\d{11}$/.test(cleaned) ? null : { cpf: true };
    };

    private futureDateValidator = (control: AbstractControl): ValidationErrors | null => {
        const v = control.value as string;
        if (!v) return null;
        const selected = new Date(v);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today ? null : { future: true };
    };

    onCpfInput(e: Event) {
        const el = e.target as HTMLInputElement;
        const formatted = this.formatCPF(el.value);
        this.form.get('cpf')?.setValue(formatted, { emitEvent: false });
    }

    private formatCPF(v: string) {
        const cleaned = (v ?? '').replace(/\D/g, '').slice(0, 11);
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return cleaned.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        if (cleaned.length <= 9) return cleaned.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }

    private onlyDigits(v: string) {
        return (v ?? '').replace(/\D/g, '');
    }

    addItem() {
        const name = (this.newItem.value ?? '').trim();
        if (!name) return;
        this.items.push(this.makeItemGroup({ id: crypto.randomUUID(), name, brought: false }));
        this.newItem.setValue('');
        this.clearFieldError('items');
    }

    removeItem(idx: number) {
        this.items.removeAt(idx);
    }

    onSubmit() {
        this.successMessage.set('');
        this.errorMessage.set('');

        this.form.markAllAsTouched();

        if (this.items.length === 0) {
            this.setFieldError('items', 'Adicione pelo menos um item');
        }

        if (this.form.invalid) {
            this.errorMessage.set('Corrija os erros do formulário.');
            return;
        }

        const raw = this.form.getRawValue();
        const payload: ParticipantCreate = {
            name: raw.name!.trim(),
            cpf: this.onlyDigits(raw.cpf!),
            breakfastDate: raw.breakfastDate!,
            items: (raw.items ?? []).map((i: any) => ({
                id: i.id,
                name: (i.name ?? '').trim(),
                brought: !!i.brought
            }))
        };

        this.submitParticipant.emit(payload);   
    }

    public displaySuccess(mode: 'created' | 'updated'): void {
        if (mode === 'created') {
            this.form.reset();
            this.items.clear();
            this.newItem.setValue('');
            this.successMessage.set('Participante adicionado com sucesso.');
        } else {
            this.successMessage.set('Participante atualizado com sucesso.');
        }
    }

    public displayError(message: string): void {
        this.errorMessage.set(message);
    }

    onCancelClick() {
        this.cancel.emit();
    }

    private setFieldError(field: string, message: string) {
        const ctrl = this.form.get(field);
        ctrl?.setErrors({ ...(ctrl.errors ?? {}), manual: message });
    }

    private clearFieldError(field: string) {
        const ctrl = this.form.get(field);
        if (!ctrl?.errors) return;
        const { manual, ...rest } = ctrl.errors as any;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
    }

    message() {
        return this.errorMessage() || this.successMessage();
    }
}
