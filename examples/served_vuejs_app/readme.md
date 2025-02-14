# Astrodon + Vue example

This examples implements a large front-end project to show how you can build
apps with Astrodon with any web framework.

> You cannot build this project with Astrodon builder but you can create a custom builder instead: see build.astrodon.ts

## Run on the fly

```sh
deno run -A --unstable --no-check https://raw.githubusercontent.com/astrodon/astrodon/main/examples/served_vuejs_app/mod.ts
```

## Bundle front-end snapshot (locally)

```sh
deno run -A --unstable --no-check build.render.ts
```

## Compile App

> Make sure to bundle your assets fists

```sh
deno run -A --unstable --no-check build.astrodon.ts
```
