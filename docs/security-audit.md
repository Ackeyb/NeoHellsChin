# Security Audit Notes

Last checked: 2026-05-19

`npm audit fix` updated the lockfile to the latest safe versions available in the current dependency ranges, including Next.js 16.2.6 and patched transitive packages such as `protobufjs`, `@protobufjs/utf8`, `tar`, and top-level `postcss`.

Two moderate audit findings remain. They come from `next@16.2.6` depending on an internal `postcss@8.4.31`. At the time of the check, `next@16.2.6` is the latest stable Next.js release reported by npm. `npm audit fix --force` proposes installing `next@9.3.3`, which is a breaking downgrade and is not a safe remediation path for this project.

Revisit this after a newer stable Next.js release updates its internal PostCSS dependency.
