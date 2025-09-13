<?php

namespace App\Services\Imports;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductCsvImporter
{
    /**
     * Colonnes attendues (en-têtes CSV, ordre libre)
     * name, slug?, category, price_cents, stock, description?
     */
    public function import(string $path, bool $dryRun = false): array
    {
        $handle = fopen($path, 'r');
        if (!$handle) throw new \RuntimeException('Impossible d’ouvrir le fichier.');

        // lire entêtes
        $headers = fgetcsv($handle, 0, ';');
        if ($headers === false) {
            fclose($handle);
            throw ValidationException::withMessages(['file' => 'CSV vide ou entêtes manquantes.']);
        }
        $headers = array_map(fn($h)=>strtolower(trim($h)), $headers);

        $required = ['name','category','price_cents','stock'];
        foreach ($required as $col) {
            if (!in_array($col, $headers)) {
                fclose($handle);
                throw ValidationException::withMessages(['file' => "Colonne obligatoire manquante: {$col}"]);
            }
        }

        $index = array_flip($headers);
        $created=0; $updated=0; $skipped=0; $errors=[]; $rownum=1;
        $rows = [];

        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            $rownum++;
            // convertir en map col=>valeur
            $data = [];
            foreach ($headers as $i=>$name) {
                $data[$name] = $row[$i] ?? null;
            }
            // trim & normalise
            $name = trim((string)($data['name'] ?? ''));
            $catName = trim((string)($data['category'] ?? ''));
            $price = (int)($data['price_cents'] ?? 0);
            $stock = (int)($data['stock'] ?? 0);
            $slug  = isset($data['slug']) ? trim((string)$data['slug']) : null;
            $desc  = isset($data['description']) ? trim((string)$data['description']) : null;

            // validations simples
            $rowErrors=[];
            if ($name === '') $rowErrors[]='name vide';
            if ($catName === '') $rowErrors[]='category vide';
            if ($price < 0) $rowErrors[]='price_cents négatif';
            if ($stock < 0) $rowErrors[]='stock négatif';

            if ($rowErrors) {
                $errors[] = ['row'=>$rownum, 'errors'=>$rowErrors];
                $skipped++;
                continue;
            }

            $rows[] = compact('name','catName','price','stock','slug','desc');
        }
        fclose($handle);

        if ($dryRun) {
            return compact('created','updated','skipped','errors','rows');
        }

        DB::transaction(function() use ($rows, &$created, &$updated) {
            foreach ($rows as $r) {
                // trouver/creer catégorie
                $cat = Category::firstOrCreate(
                    ['slug' => \Str::slug($r['catName'])],
                    ['name' => $r['catName']]
                );

                // upsert par slug si fourni, sinon par (name, category_id)
                $where = [];
                if ($r['slug']) {
                    $where = ['slug' => $r['slug']];
                } else {
                    $where = ['category_id'=>$cat->id, 'name'=>$r['name']];
                }

                $existing = Product::where($where)->first();

                if ($existing) {
                    $existing->update([
                        'category_id' => $cat->id,
                        'name'        => $r['name'],
                        'slug'        => $existing->slug ?: ($r['slug'] ?: \Str::slug($r['name'].'-'.time())),
                        'price_cents' => $r['price'],
                        'stock'       => $r['stock'],
                        'description' => $r['desc'],
                    ]);
                    $updated++;
                } else {
                    Product::create([
                        'category_id' => $cat->id,
                        'name'        => $r['name'],
                        'slug'        => $r['slug'] ?: \Str::slug($r['name'].'-'.time()),
                        'price_cents' => $r['price'],
                        'stock'       => $r['stock'],
                        'description' => $r['desc'],
                    ]);
                    $created++;
                }
            }
        });

        return compact('created','updated','skipped','errors');
    }
}
