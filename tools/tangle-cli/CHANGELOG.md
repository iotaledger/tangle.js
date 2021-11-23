# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.10.0

### Added

- New options to specify custom explorer URL (`--explorer, -e`), permanode URL (`--permanode, -p`) and network ID (`--net, -i`). See changes below regarding `--net`.
- Support for `--devnet` in identity commands.
- Support for Private Tangle is now possible using the new options above.
- This change log.
- Prettier for code formatting.
- Script to generate README usage sections.

### Changed

- Renamed node URL option `--net, -n` to `--node, -n`.
- Updated @iota/identity-wasm to 0.4.0.
- Updated @iota/iota.js to 1.8.2 and added @iota/util.js
- ES lint configuration aligned with GTSC projects.
- Updated README.
