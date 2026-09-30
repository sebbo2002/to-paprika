# [2.0.0](https://github.com/sebbo2002/to-paprika/compare/v1.0.0...v2.0.0) (2026-09-30)

### Bug Fixes

- correct config mount path in boot-up check to /home/node ([aaaa34a](https://github.com/sebbo2002/to-paprika/commit/aaaa34a2ff19829f9cceedb590fd7feafca4c36c))
- create dummy config for CI boot-up check ([bf86da3](https://github.com/sebbo2002/to-paprika/commit/bf86da3ec8932216b83d6dcbf522863ee924a1c2))
- Fix role issue ([ec46377](https://github.com/sebbo2002/to-paprika/commit/ec4637727e33d836496aaab322a1d4b10e6dec74))
- update archiver v8 API usage and fix TypeDoc errors ([f7d912d](https://github.com/sebbo2002/to-paprika/commit/f7d912d3df2513ca9179039aeb34a21e069462d7))

### Features

- Add `x-split-pages` header ([c303983](https://github.com/sebbo2002/to-paprika/commit/c303983c7616eced417f5215f92d41deaa3e96ae))
- Add pdf to supported server file types ([6542646](https://github.com/sebbo2002/to-paprika/commit/654264656637ec37a204035c665355350848baa4))
- Convert multipage pdfs into pngs ([d40fc9e](https://github.com/sebbo2002/to-paprika/commit/d40fc9e799554bcdc566cd7a65f0f847deff8911))
- Drop support for node.js v20 and v23 ([d949a08](https://github.com/sebbo2002/to-paprika/commit/d949a088c82ede8768c62556cfc0da9ce2255b1b))
- Reveal created file after generation (cli only) ([6c20173](https://github.com/sebbo2002/to-paprika/commit/6c2017372b52ad80594dc64b7d79644b89ce39bd))
- Update Docker Base Image ([2ff47ce](https://github.com/sebbo2002/to-paprika/commit/2ff47ce0a7c9ec5e27a8af618d73c907ccf413a1))

### BREAKING CHANGES

- Drop node.js v20 / v23 Support

This node.js version is no longer supported. For more information see https://nodejs.dev/en/about/releases/

- Containers for linux/arm/v7 and linux/arm/v6 are no longer built automatically, as they are no longer available for node:lts-alpine. Please build these containers yourself if you need to. New supported platforms: linux/amd64 and linux/arm64/v8

# 1.0.0 (2025-11-05)

### Bug Fixes

- **CI:** Fix DockerHub container release ([01b7534](https://github.com/sebbo2002/to-paprika/commit/01b753406d1f1ef24a949c7d7b946d99b779d013))

### Build System

- Deprecate node.js 12 ([426588b](https://github.com/sebbo2002/to-paprika/commit/426588b4bb7bde2924bbc92006ca839e960872e1))
- Deprecate node.js v14 / v17 ([7a2de45](https://github.com/sebbo2002/to-paprika/commit/7a2de45c12f19a1ec441b3a004f4aa935efc197c))
- Native ESM support ([7b86a4f](https://github.com/sebbo2002/to-paprika/commit/7b86a4f1187c387a3a5792e1fb72d822b04e3631))

### chore

- Drop node v18 support ([3e18405](https://github.com/sebbo2002/to-paprika/commit/3e18405ac1e1be738a414623f97169c802567f99))
- Drop support for node.js v19 and v21 ([2fff079](https://github.com/sebbo2002/to-paprika/commit/2fff079040a377fbe9ecc340388f6a29b863cf80))
- Remove node.js 10 Support ([2b910c0](https://github.com/sebbo2002/to-paprika/commit/2b910c09bc8a41085fc4472159494d8738d5521e))

### Features

- first commit ([707c767](https://github.com/sebbo2002/to-paprika/commit/707c76732892870b729f599ad37dc1e164a732e9))

### Reverts

- Revert "ci: Run tests with node.js v18, v20 and v21" ([405853b](https://github.com/sebbo2002/to-paprika/commit/405853bbd7fc55eb224ff657af7dab26f9482d88))

### BREAKING CHANGES

- Drop node.js v18 Support

This node.js version is no longer supported. For more information see https://nodejs.dev/en/about/releases/

- Drop node.js v21 Support

These node.js versions are no longer supported. For more information see https://nodejs.dev/en/about/releases/

- The node.js versions v14 and v17 are no longer maintained and are therefore no longer supported. See https://nodejs.dev/en/about/releases/ for more details on node.js release cycles.
- From now on, only node.js ^14.8.0 || >=16.0.0 are supported
- Only Support for node.js ^12.20.0 || >=14.13.1
- Removed support for node.js v10
