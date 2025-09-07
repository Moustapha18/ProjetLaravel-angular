import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../services/users.service';

@Component({
  standalone: true,
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2 class="text-xl font-semibold mb-3">{{ id ? 'Éditer' : 'Nouvel' }} utilisateur</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-lg">
      <label>Nom</label>
      <input class="border rounded p-2" formControlName="name"/>
      <div class="text-xs text-red-600" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Nom requis</div>

      <label>Email</label>
      <input type="email" class="border rounded p-2" formControlName="email"/>
      <div class="text-xs text-red-600" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">Email invalide</div>

      <label>Rôle</label>
      <select class="border rounded p-2" formControlName="role">
        <option value="ADMIN">ADMIN</option>
        <option value="EMPLOYE">EMPLOYÉ</option>
        <option value="CLIENT">CLIENT</option>
      </select>

      <div class="flex gap-2 mt-2">
        <button class="px-3 py-2 border rounded" [disabled]="form.invalid">Enregistrer</button>
        <a routerLink="/admin/users" class="px-3 py-2 border rounded">Annuler</a>
      </div>
    </form>

    <div *ngIf="id" class="mt-4">
      <button class="px-3 py-2 border rounded" (click)="reset()">Réinitialiser mot de passe</button>
    </div>
  `
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(UsersService);

  id?: number;
  form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    role: this.fb.nonNullable.control<'ADMIN'|'EMPLOYE'|'CLIENT'>('CLIENT', Validators.required),
  });

  ngOnInit(){
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param ? +param : undefined;
    if (this.id) { this.svc.find(this.id).subscribe(u => this.form.patchValue(u as any)); }
  }
  save(){
    const payload = this.form.getRawValue();
    const req$ = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);
    req$.subscribe(()=> this.router.navigateByUrl('/admin/users'));
  }
  reset(){ if(!this.id) return; this.svc.resetPassword(this.id).subscribe(()=> alert('Mot de passe réinitialisé (check mail).')); }
}
