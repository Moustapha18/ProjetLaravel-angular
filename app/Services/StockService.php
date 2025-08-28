namespace App\Services; use App\Models\Product; use Illuminate\Database\Eloquent\ModelNotFoundException;
class StockService {
public function assertAndDecrement(array $items): void {
foreach($items as $it){
$p = Product::lockForUpdate()->find($it['product_id']);
if(!$p) throw new ModelNotFoundException();
if($p->stock < $it['qty']) abort(422, "Stock insuffisant pour {$p->name}");
$p->decrement('stock', $it['qty']);
}
}
}
