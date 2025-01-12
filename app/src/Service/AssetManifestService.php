<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class AssetManifestService
{
private string $manifestPath;

public function __construct(ParameterBagInterface $parameterBag)
{
$this->manifestPath = $parameterBag->get('kernel.project_dir') . '/public/build/.vite/manifest.json';
}

public function getAsset(string $entry): string
{
if (!file_exists($this->manifestPath)) {
throw new \Exception("Le fichier manifest.json est introuvable.");
}

$manifest = json_decode(file_get_contents($this->manifestPath), true);

if (!isset($manifest[$entry])) {
throw new \Exception("L'entrée '$entry' est introuvable dans le fichier manifest.json.");
}

return '/build/' . $manifest[$entry]['file'];
}
}
