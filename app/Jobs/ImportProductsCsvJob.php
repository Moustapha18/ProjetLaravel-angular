<?php

namespace App\Jobs;

use App\Services\Imports\ProductCsvImporter;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class ImportProductsCsvJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(public string $storedPath, public bool $dryRun = false){}

    public function handle(ProductCsvImporter $importer): void
    {
        $importer->import(storage_path('app/'.$this->storedPath), $this->dryRun);
    }
}
