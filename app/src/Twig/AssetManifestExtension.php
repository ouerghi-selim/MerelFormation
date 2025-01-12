<?php

namespace App\Twig;

use App\Service\AssetManifestService;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AssetManifestExtension extends AbstractExtension
{
    private AssetManifestService $assetManifestService;

    public function __construct(AssetManifestService $assetManifestService)
    {
        $this->assetManifestService = $assetManifestService;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('asset_from_manifest', [$this->assetManifestService, 'getAsset']),
        ];
    }
}
