---
title: API docs — indukto
description: Gallery Data API — machine-readable photo gallery manifest.
---

# Gallery Data API

A tiny read-only API exposing the photo gallery manifest for [indukto.eu](https://indukto.eu/photo.html).

## GET /photos.json

Returns the gallery manifest as JSON.

```json
{
  "photos": ["01-sunset.avif", "..."]
}
```

Each entry is a filename served under `https://indukto.eu/photos/`, listed in display order.

## GET /status.json

Returns service health as JSON (`{"status": "ok"}`).

## Machine-readable description

The OpenAPI 3.1 specification for this API lives at [/openapi.json](https://indukto.eu/openapi.json). It is discoverable via the API catalog at [/.well-known/api-catalog](https://indukto.eu/.well-known/api-catalog) ([RFC 9727](https://www.rfc-editor.org/info/rfc9727)).
