<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture {{ $number }}</title>
    <style>
        body{ font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #222; }
        .header{ margin-bottom: 20px; }
        .muted{ color:#666; }
        table{ width:100%; border-collapse: collapse; margin-top:10px; }
        th, td{ border:1px solid #ddd; padding:8px; text-align:left; }
        th{ background:#f7f7f7; }
        .totals td{ border:none; }
        .right{ text-align:right; }
    </style>
</head>
<body>
<div class="header">
    <h2>Facture {{ $number }}</h2>
    <div class="muted">Date: {{ now()->format('d/m/Y H:i') }}</div>
    <div>Client: {{ $order->user->name }} ({{ $order->user->email }})</div>
    <div>Adresse: {{ $order->address }}</div>
</div>

<table>
    <thead>
    <tr>
        <th>Produit</th>
        <th class="right">Qté</th>
        <th class="right">PU (CFA)</th>
        <th class="right">Total ligne (CFA)</th>
    </tr>
    </thead>
    <tbody>
    @foreach($order->items as $it)
        <tr>
            <td>{{ $it->product->name }}</td>
            <td class="right">{{ $it->qty }}</td>
            <td class="right">{{ number_format($it->unit_price_cents/1, 0, ',', ' ') }}</td>
            <td class="right">{{ number_format($it->line_total_cents/1, 0, ',', ' ') }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

<table class="totals" style="margin-top:15px;">
    <tr>
        <td class="right" style="width:80%;"><strong>Total (CFA)</strong></td>
        <td class="right" style="width:20%;"><strong>{{ number_format($order->total_cents/1, 0, ',', ' ') }}</strong></td>
    </tr>
</table>

<p class="muted" style="margin-top:20px;">Merci pour votre achat.</p>
</body>
</html>
