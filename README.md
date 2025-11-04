# 🫑 to-paprika

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

Simple script that feeds a photo or PDF of a recipe into an OpenAPI-compatible API and generates a
[Paprika Recipes](https://www.paprikaapp.com/)-compatible export. The CLI supports multiple files at
once. PDFs are automatically split into individual pages, and each page is processed separately
(corresponding to one recipe per page). HEIC images are also supported. There is also a small web
server that provides a simple HTTP API that does the same thing.

## ⚡️ Quick Start

```shell
# Install the CLI globally
npm i -g @sebbo2002/to-paprika

# Run Setup Wizard
to-paprika setup

# Convert file to Paprika Recipe format
to-paprika convert ./path/to/your/file.jpg

# Run simple HTTP server
to-paprika server
```

There's also a container image available on [Docker Hub](https://hub.docker.com/r/sebbo2002/to-paprika):

```shell
docker run --rm \
  -v $(pwd):/data \
  -e TO_PAPRIKA_CONFIG_PATH=/data/to-paprika-config.json \
  sebbo2002/to-paprika \
  cli convert /data/path/to/your/file.jpg
```

## 📱 Apple Shortcut

You can use this [Apple Shortcut](https://www.icloud.com/shortcuts/c1fd034864b34f60a75821811bc1696c)
to easily use the HTTP API from your iPhone or iPad. Ensure to change the URL and add your Auth Token.

## 🙆🏼‍♂️ Copyright and license

Copyright (c) Sebastian Pekarek under the [MIT license](LICENSE).
