<?php
// app/Services/ImageService.php
namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class ImageService
{
    /**
     * Sauvegarde une image redimensionnée (ex: 800px max largeur), retourne le path public.
     */
    public function storeProductImage(\SplFileInfo $file, ?string $oldPath = null): string
    {
        // lire binaire
        $img = Image::make($file->getRealPath());

        // redimension sécurisée (max 800px de large)
        $img->resize(800, null, function($c){ $c->aspectRatio(); $c->upsize(); });

        // encode en webp (léger) sinon jpg
        $ext = strtolower($file->getExtension());
        $isWebp = in_array($ext, ['webp']);
        $encoded = $isWebp ? $img->encode('webp', 85) : $img->encode('jpg', 85);

        // chemin
        $filename = uniqid('prod_', true) . ($isWebp ? '.webp' : '.jpg');
        $path = "products/{$filename}";

        Storage::disk('public')->put($path, $encoded);

        // supprimer l’ancienne si fournie
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $path;
    }
}
