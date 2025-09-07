import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminStatsService, AdminStats } from '../../services/admin-stats.service';
import { ActivatedRoute, Router } from '@angular/router';

type SalesPoint = { date: string; total_cents: number };

@Component({
  standalone: true,
  selector: 'app-admin-stats',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <h2 class="text-xl font-semibold mb-4">Tableau de bord</h2>

    <!-- Filtres période -->
    <div class="flex flex-wrap items-end gap-3 mb-4">
      <div class="grid">
        <label class="text-xs text-gray-600">Préréglage</label>
        <select class="border rounded p-2" [(ngModel)]="preset" (change)="applyPreset()">
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="this_month">Mois en cours</option>
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      <div class="grid">
        <label class="text-xs text-gray-600">Du</label>
        <input class="border rounded p-2" type="date" [(ngModel)]="start" (change)="applyCustom()" [disabled]="preset!=='custom'"/>
      </div>
      <div class="grid">
        <label class="text-xs text-gray-600">Au</label>
        <input class="border rounded p-2" type="date" [(ngModel)]="end" (change)="applyCustom()" [disabled]="preset!=='custom'"/>
      </div>

      <button class="px-3 py-2 border rounded" (click)="refresh()">Actualiser</button>
    </div>

    <!-- KPIs -->
    <div *ngIf="loading()" class="grid md:grid-cols-4 gap-3 mb-6">
      <div class="p-4 border rounded animate-pulse h-24" *ngFor="let _ of [1,2,3,4]"></div>
    </div>

    <div *ngIf="!loading() && stats() as s" class="grid md:grid-cols-4 gap-3 mb-6">
      <div class="p-4 border rounded"><div class="text-sm text-gray-500">Produits</div><div class="text-2xl font-semibold">{{ s.totals.products }}</div></div>
      <div class="p-4 border rounded"><div class="text-sm text-gray-500">Commandes</div><div class="text-2xl font-semibold">{{ s.totals.orders }}</div></div>
      <div class="p-4 border rounded"><div class="text-sm text-gray-500">Clients</div><div class="text-2xl font-semibold">{{ s.totals.customers }}</div></div>
      <div class="p-4 border rounded"><div class="text-sm text-gray-500">Revenu</div><div class="text-2xl font-semibold">{{ (s.totals.revenue_cents||0)/100 | currency:'XOF' }}</div></div>
    </div>

    <!-- Courbe -->
    <div class="border rounded p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="font-medium">Ventes ({{ rangeLabel() || '—' }})</div>
        <div class="text-xs text-gray-500" *ngIf="!loading() && points().length">{{ points().length }} point(s)</div>
      </div>

      <div *ngIf="loading()" class="h-56 animate-pulse bg-gray-50 rounded"></div>

      <div *ngIf="!loading() && !points().length" class="text-gray-500">
        Aucune donnée de vente pour la période.
      </div>

      <div *ngIf="!loading() && points().length" class="w-full">
        <canvas #chart class="w-full" style="max-width: 100%; height: 320px;"></canvas>
        <div class="mt-2 text-xs text-gray-600 flex flex-wrap gap-4">
          <span>Max: {{ (maxValue()/100) | currency:'XOF' }}</span>
          <span>Moyenne: {{ (avgValue()/100) | currency:'XOF' }}</span>
          <span>Total: {{ (sumValue()/100) | currency:'XOF' }}</span>
        </div>
      </div>
    </div>
  `
})
export class AdminStatsComponent implements OnInit, AfterViewInit, OnDestroy {
  private svc   = inject(AdminStatsService);
  private route = inject(ActivatedRoute);
  private router= inject(Router);

  @ViewChild('chart') canvasRef?: ElementRef<HTMLCanvasElement>;
  private resizeObs?: ResizeObserver;

  loading = signal(false);
  stats   = signal<AdminStats | null>(null);
  points  = signal<SalesPoint[]>([]);

  // période (query params)
  preset: '7d'|'30d'|'90d'|'this_month'|'custom' = '30d';
  start = ''; // YYYY-MM-DD
  end   = '';

  // dérivés
  maxValue = signal(0);
  avgValue = signal(0);
  sumValue = signal(0);
  rangeLabel = signal('');

  constructor() {
    effect(() => {
      const s = this.stats();
      const pts = s?.sales_over_time ?? [];
      this.points.set(pts);
      const vals = pts.map(p => p.total_cents || 0);
      const sum = vals.reduce((a,b)=>a+b, 0);
      const max = vals.length ? Math.max(...vals) : 0;
      const avg = vals.length ? Math.round(sum / vals.length) : 0;
      this.sumValue.set(sum);
      this.maxValue.set(max);
      this.avgValue.set(avg);
      if (pts.length) this.rangeLabel.set(`${pts[0].date} — ${pts[pts.length-1].date}`); else this.rangeLabel.set('');
      queueMicrotask(()=> this.draw());
    });
  }

  ngOnInit() {
    // Lire la période depuis les query params
    this.route.queryParamMap.subscribe(p => {
      const qpPreset = (p.get('preset') as any) || '30d';
      const qpStart  = p.get('start') || '';
      const qpEnd    = p.get('end') || '';
      this.preset = qpPreset;
      if (this.preset === 'custom') {
        this.start = qpStart;
        this.end   = qpEnd;
      } else {
        const { start, end } = this.computeRange(this.preset);
        this.start = start; this.end = end;
      }
      this.fetch();
    });
  }

  ngAfterViewInit() {
    this.draw();
    if (this.canvasRef?.nativeElement) {
      this.resizeObs = new ResizeObserver(() => this.draw());
      this.resizeObs.observe(this.canvasRef.nativeElement);
    }
  }
  ngOnDestroy() { this.resizeObs?.disconnect(); }

  // Actions UI
  applyPreset() {
    if (this.preset !== 'custom') {
      const { start, end } = this.computeRange(this.preset);
      this.navigate({ preset: this.preset, start, end });
    } else {
      // passe en custom, garde les dates actuelles (ou vide)
      this.navigate({ preset: 'custom', start: this.start || '', end: this.end || '' });
    }
  }
  applyCustom() {
    if (this.preset !== 'custom') this.preset = 'custom';
    this.navigate({ preset: 'custom', start: this.start || '', end: this.end || '' });
  }
  refresh() { this.fetch(); }

  private navigate(q: { preset:string; start?:string; end?:string }) {
    this.router.navigate([], { queryParams: q, queryParamsHandling: 'merge' });
  }

  // Data
  private fetch() {
    this.loading.set(true);
    const params: any = { preset: this.preset };
    if (this.start) params.start = this.start;
    if (this.end)   params.end   = this.end;
    this.svc.get(params).subscribe({
      next: (res) => { this.stats.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  // Ranges utilitaires
  private computeRange(preset: '7d'|'30d'|'90d'|'this_month'|'custom') {
    const tz = 'Africa/Dakar'; // indicatif, on reste en YYYY-MM-DD
    const today = new Date(); // date locale
    const toISO = (d: Date) => d.toISOString().slice(0,10);

    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(end);

    if (preset === '7d')  start.setDate(end.getDate() - 6);
    if (preset === '30d') start.setDate(end.getDate() - 29);
    if (preset === '90d') start.setDate(end.getDate() - 89);
    if (preset === 'this_month') {
      start.setDate(1);
    }
    // 'custom' -> garder les valeurs actuelles si déjà définies
    if (preset === 'custom' && this.start && this.end) {
      return { start: this.start, end: this.end };
    }
    return { start: toISO(start), end: toISO(end) };
  }

  // Canvas chart (idem)
  private draw() {
    const canvas = this.canvasRef?.nativeElement;
    const s = this.stats(); const pts = s?.sales_over_time ?? [];
    if (!canvas || !pts.length) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth || 600;
    const cssHeight = 320;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.scale(dpr, dpr);

    const W = cssWidth, H = cssHeight;
    const P = { l: 40, r: 10, t: 10, b: 28 };
    ctx.clearRect(0,0,W,H);

    const points = pts.map(p => ({ xLabel: p.date, y: (p.total_cents||0)/100 }));
    const maxY = Math.max(1, ...points.map(p => p.y));
    const stepY = niceStep(maxY/4);
    const topY = Math.ceil(maxY/stepY)*stepY;

    const plotW = W - P.l - P.r;
    const plotH = H - P.t - P.b;

    // grid Y
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let y=0; y<=topY; y+=stepY){
      const py = map(y, 0, topY, P.t+plotH, P.t);
      ctx.beginPath(); ctx.moveTo(P.l, py); ctx.lineTo(W-P.r, py); ctx.stroke();
      ctx.fillStyle = '#6b7280'; ctx.font = '10px system-ui,sans-serif';
      ctx.fillText(formatMoney(y), 4, py+3);
    }
    // axis X
    ctx.beginPath(); ctx.moveTo(P.l, P.t+plotH); ctx.lineTo(W-P.r, P.t+plotH); ctx.stroke();

    // ticks X
    const n = points.length, tickCount = Math.min(6, n);
    for (let i=0;i<tickCount;i++){
      const idx = Math.floor(i*(n-1)/(tickCount-1||1));
      const px = P.l + (plotW * idx / Math.max(1, n-1));
      ctx.fillStyle = '#6b7280'; ctx.textAlign='center';
      ctx.fillText(points[idx].xLabel, px, H-4);
    }

    // line
    ctx.beginPath();
    for (let i=0;i<n;i++){
      const x = P.l + (plotW * i / Math.max(1, n-1));
      const y = map(points[i].y, 0, topY, P.t+plotH, P.t);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.stroke();

    // dots
    for (let i=0;i<n;i++){
      const x = P.l + (plotW * i / Math.max(1, n-1));
      const y = map(points[i].y, 0, topY, P.t+plotH, P.t);
      ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2); ctx.fillStyle='#1d4ed8'; ctx.fill();
    }
  }
}

// helpers
function map(v:number,aMin:number,aMax:number,bMin:number,bMax:number){ if(aMax===aMin) return (bMin+bMax)/2; return bMin + (v-aMin)*(bMax-bMin)/(aMax-aMin); }
function niceStep(v:number){ if(v<=0) return 1; const pow=10**Math.floor(Math.log10(v)); const n=v/pow; if(n<1.5) return 1*pow; if(n<3) return 2*pow; if(n<7) return 5*pow; return 10*pow; }
function formatMoney(x:number){ try{ return new Intl.NumberFormat(undefined,{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(x);}catch{return `${Math.round(x)} XOF`;} }
