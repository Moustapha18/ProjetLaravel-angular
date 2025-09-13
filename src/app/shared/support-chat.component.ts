import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ChatMsg = { role: 'bot' | 'user'; text: string; at?: Date };

@Component({
  selector: 'app-support-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="chat" [class.chat-hidden]="minimized">
      <header class="chat-header">
        <h3>Support client</h3>
        <button class="icon" (click)="minimized = true" aria-label="Fermer">✕</button>
      </header>

      <!-- zone scrollable -->
      <div #scrollBody class="chat-body">
        <div *ngFor="let m of messages" class="msg" [class.user]="m.role === 'user'">
          <div class="bubble">
            <div class="text">{{ m.text }}</div>
            <div class="time" *ngIf="m.at">{{ m.at | date:'HH:mm' }}</div>
          </div>
        </div>
      </div>

      <!-- input en bas -->
      <form class="chat-footer" (ngSubmit)="send()">
        <input
          class="input"
          name="draft"
          [(ngModel)]="draft"
          autocomplete="off"
          placeholder="Posez votre question…"
        />
        <button class="send" type="submit" [disabled]="!draft.trim()">Envoyer</button>
      </form>
    </section>

    <!-- bouton flottant quand réduit -->
    <button *ngIf="minimized" class="fab" (click)="open()" aria-label="Ouvrir le support">💬</button>
  `,
  styles: [`
    :host{ position:fixed; right:16px; bottom:16px; z-index:1050; }

    .chat{
      width:min(420px,92vw);
      height:min(70vh,520px);
      background:#fff;
      border:1px solid #e5e7eb;
      border-radius:12px;
      box-shadow:0 10px 30px rgba(0,0,0,.15);
      display:grid;
      grid-template-rows:auto 1fr auto;
      overflow:hidden;
    }
    .chat-hidden{ display:none; }

    .chat-header{
      display:flex; align-items:center; justify-content:space-between;
      padding:10px 12px; background:#fff7ed; border-bottom:1px solid #fde68a;
    }
    .chat-header h3{ margin:0; font-size:15px; }
    .icon{ border:none; background:transparent; font-size:16px; cursor:pointer; }

    .chat-body{
      padding:10px;
      display:flex; flex-direction:column; gap:8px;
      overflow-y:auto;                 /* ← SCROLL */
      scroll-behavior:smooth;          /* ← doux */
      background:#fff;
    }

    .msg{ display:flex; }
    .msg.user{ justify-content:flex-end; }
    .bubble{
      max-width:80%;
      background:#fef3c7;             /* bot */
      padding:10px 12px;
      border-radius:12px;
      box-shadow:0 1px 2px rgba(0,0,0,.05);
      white-space:pre-wrap; word-break:break-word;
    }
    .msg.user .bubble{ background:#dbeafe; } /* user */

    .text{ font-size:14px; }
    .time{ font-size:11px; opacity:.6; margin-top:4px; text-align:right; }

    .chat-footer{
      position:sticky; bottom:0;       /* reste visible */
      display:flex; gap:8px; padding:10px;
      background:#fff; border-top:1px solid #eee;
    }
    .input{
      flex:1; min-width:0;
      padding:10px 12px; border:1px solid #ddd; border-radius:10px;
    }
    .send{
      padding:10px 14px; border:none; border-radius:10px;
      background:#0ea5e9; color:#fff; cursor:pointer;
    }

    .fab{
      width:56px; height:56px; border:none; border-radius:50%;
      background:#f59e0b; color:#fff; font-size:22px; cursor:pointer;
      box-shadow:0 8px 20px rgba(0,0,0,.2);
    }
  `]
})
export class SupportChatComponent implements AfterViewInit {
  @ViewChild('scrollBody') private scrollBody!: ElementRef<HTMLElement>;

  minimized = false;
  draft = '';

  messages: ChatMsg[] = [
    {
      role: 'bot',
      text:
`Bonjour 👋
Je suis là pour vous aider.
Exemples utiles :
• Horaires d’ouverture
• Livraison & zones
• Modes de paiement
• Promotions / codes
• Facture PDF
• Suivi de commande`,
      at: new Date()
    }
  ];

  ngAfterViewInit() { this.scrollToBottom(); }

  open() {
    this.minimized = false;
    setTimeout(() => this.scrollToBottom(), 0);
  }

  send() {
    const msg = this.draft.trim();
    if (!msg) return;

    this.messages.push({ role: 'user', text: msg, at: new Date() });
    this.draft = '';
    this.scrollToBottom();

    const reply = this.answer(msg);
    this.messages.push({ role: 'bot', text: reply, at: new Date() });
    // laisse le DOM peindre puis scroll
    setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom() {
    try {
      const el = this.scrollBody?.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  // Réponses "règles simples" (mots-clés)
  private answer(q: string): string {
    const s = q.toLowerCase();

    // --- conseils produits
    if (/(conseille|idee|idée|recommande)/.test(s)) {
      if (/sucre|sucré|dessert|gateau|gâteau|viennoiserie/.test(s))
        return 'Côté sucré 🍰 : tiramisu maison, pain au chocolat, cookies. Envie de lequel ?';
      if (/sale|salé|sandwich|burger|salade/.test(s))
        return 'Côté salé 🥪 : burger “twins”, quiche, sandwich poulet. Je vous suggère “twins” si vous aimez le cheddar.';
      if (/boisson|cafe|café|jus|the|thé/.test(s))
        return 'Boissons 🥤 : jus maison (gingembre, bissap), café latte, thé glacé.';
      return 'Je peux vous conseiller selon vos envies : “sucré”, “salé” ou “boisson”. Que préférez-vous ?';
    }

    // --- horaires
    if (/horaire|ouvert|heure|fermeture|ouverture|dimanche/.test(s))
      return 'Horaires 🕒 : lun-sam 7h-20h, dim 8h-13h. Service en ligne 7j/7.';

    // --- livraison
    if (/livraison|livrer|zone|frais/.test(s))
      return 'Livraison 🚚 : centre-ville, Zone A, Zone B. Délai moyen 30-45 min. Frais selon distance.';

    // --- paiement
    if (/paiement|payer|carte|cash|espece|espèce|mobile/.test(s))
      return 'Paiement 💳 : carte, mobile money et espèces à la livraison.';

    // --- promos
    if (/promo|code|reduction|réduction|remise/.test(s))
      return 'Promos 🎉 : utilisez un code lors du paiement. Les réductions produit s’appliquent automatiquement.';

    // --- facture
    if (/facture|recu|reçu|pdf/.test(s))
      return 'Facture 🧾 : depuis “Mes commandes”, bouton “Facture PDF”.';

    // --- suivi
    if (/suivi|statut|commande|ou en est/.test(s))
      return 'Suivi 📦 : consultez “Mes commandes”. Les statuts se mettent à jour en temps réel.';

    // fallback
    return `Je n’ai pas bien compris 🤔.
Pouvez-vous reformuler ?
Astuce : essayez « horaires », « promotions », « facture PDF », « livraison », « paiement », « suivi de commande ».`;
  }
}
