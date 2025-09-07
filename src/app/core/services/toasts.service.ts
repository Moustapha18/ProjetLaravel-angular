import { Injectable, signal } from '@angular/core';
export type Toast = { id:number; type:'success'|'error'|'info'; text:string };
@Injectable({ providedIn:'root' })
export class ToastsService {
  list = signal<Toast[]>([]);
  private seq = 1;
  private push(type:Toast['type'], text:string){ 
    const t = { id:this.seq++, type, text };
    this.list.update(v => [...v, t]);
    setTimeout(()=> this.dismiss(t.id), 4000);
  }
  success(t:string){ this.push('success', t); }
  error(t:string){ this.push('error', t); }
  info(t:string){ this.push('info', t); }
  dismiss(id:number){ this.list.update(v => v.filter(x=>x.id!==id)); }
}
