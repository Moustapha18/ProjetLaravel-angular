// src/app/features/support/chat-widget/chat-widget.component.ts
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService } from '../../../core/services/support.service';

@Component({
  standalone: true,
  selector: 'app-chat-widget',
  imports: [CommonModule, FormsModule],
  styles: [`
  .chat-fab { position: fixed; right: 16px; bottom: 16px; background:#111; color:#fff; border-radius:999px; padding:12px 16px; cursor:pointer; }
  .chat-box { position: fixed; right: 16px; bottom: 72px; width: 320px; max-height: 60vh; background:#fff; border:1px solid #eee; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.15); display:flex; flex-direction:column; }
  .chat-header { padding:10px; border-bottom:1px solid #eee; font-weight:600; display:flex; justify-content:space-between; align-items:center; }
  .chat-messages { padding:10px; overflow:auto; flex:1; }
  .msg { margin-bottom:8px; }
  .msg.me { text-align:right; }
  .msg .bubble { display:inline-block; padding:8px 10px; border-radius:10px; background:#f3f4f6; }
  .msg.me .bubble { background:#111; color:#fff; }
  .chat-input { display:flex; gap:6px; padding:10px; border-top:1px solid #eee; }
  input[type="text"]{ flex:1; padding:8px 10px; border:1px solid #ddd; border-radius:8px; }
  button{ padding:8px 10px; border:none; border-radius:8px; background:#111; color:#fff; cursor:pointer; }
  `],
  template: `
  <div class="chat-fab" (click)="toggle()">
    💬 Support
  </div>

  <div class="chat-box" *ngIf="opened()">
    <div class="chat-header">
      <span>Support</span>
      <button (click)="toggle()">✕</button>
    </div>

    <div class="chat-messages" #scrollRef>
      <div *ngFor="let m of messages()" class="msg" [class.me]="m.mine">
        <div class="bubble">
          <small *ngIf="!m.mine" style="opacity:.6">{{ m.sender_type === 'BOT' ? 'Assistant' : 'Support' }}</small>
          <div>{{ m.body }}</div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input type="text" [(ngModel)]="draft" (keyup.enter)="send()" placeholder="Votre message...">
      <button (click)="send()">Envoyer</button>
      <button title="Demander à l'IA" (click)="send(true)">🤖</button>
    </div>
  </div>
  `
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  private api = inject(SupportService);

  opened = signal(false);
  threadId?: number;
  messages = signal<any[]>([]);
  draft = '';
  pollId?: any;

  toggle(){ this.opened.set(!this.opened()); }

 // ChatWidgetComponent.ngOnInit()
ngOnInit(){
  this.api.ensureThread().subscribe({
    next: t => { this.threadId = t.id; this.loadMessages(); this.startPolling(); },
    error: () => { /* pas connecté: on désactive le polling sans casser l’UI */ }
  });
}


  ngOnDestroy(){ this.stopPolling(); }

  private startPolling(){
    this.stopPolling();
    this.pollId = setInterval(() => this.loadMessages(), 2000); // “quasi temps réel”
  }
  private stopPolling(){ if (this.pollId) { clearInterval(this.pollId); this.pollId = undefined; } }

  loadMessages(){
    if (!this.threadId) return;
    this.api.messages(this.threadId).subscribe(res => this.messages.set(res.data || []));
  }

  send(toBot = false){
    const text = this.draft.trim();
    if (!text || !this.threadId) return;
    this.api.send(this.threadId, text, toBot).subscribe(() => {
      this.draft = '';
      this.loadMessages();
    });
  }
  
}
