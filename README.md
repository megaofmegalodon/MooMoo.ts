# MooMoo.ts

A modern, TypeScript-based implementation of MooMoo.io's frontend.
This repo provides a clean and type-safe alternative for modding.
The perfect boilerplate for developers looking to build their own clients for the game.
> Note: Although all the core features have already been ported to TypeScript,
some features (e.g. mobile support, lockDir/aim locking, etc) are currently missing.

# Getting Started

## For TypeScript developers
If you prefer working with types and modern syntax.
1. Clone the repo
```bash
git clone https://github.com/megaofmegalodon/MooMoo.ts.git
```

2. Install dependencies
```bash
npm install
```

3. Build / Run 
```bash
npm run build
```

## For JavaScript developers
Because TypeScript "compiles" down to JavaScript,
developers who are not familar with TypeScript can easily transpile this repo into a JS codebase.

1. Clone the repo
```bash
git clone https://github.com/megaofmegalodon/MooMoo.ts.git
```

2. Install dependencies
```bash
npm install
```

3. Transpile to JavaScript
```bash
npx tsc
```

4. Source Directory<br>
Replace the current source directory with the transpiled JS.

5. Update Bundler<br>
Ensure that the esbuild points to the correct source file.
> Just change "src/index.ts" to "src/index.js"

# Usage
After installing the source files, you can work on the client in any code editor.
To run your code live on MooMoo.io, use a Tampermonkey script to dynamically load your local build.

1. Tampermonkey Loader
```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-07-19
// @description  try to take over the world!
// @author       You
// @match        *://*.moomoo.io/*
// @run-at       document-start
// @connect      localhost
// @grant        none
// ==/UserScript==

// because MooMoo.ts is a typescript port of MooMoo.io's local
// client side code, it expects that it is the only "client" that runs.
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.tagName === "SCRIPT" && node.src.includes("index-")) {
                node.remove();
            }
        });
    });
});

observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener("DOMContentLoaded", () => {
    const cloudflareScript = document.createElement("script");
    cloudflareScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    cloudflareScript.async = true;
    cloudflareScript.onload = () => {
        const modScript = document.createElement("script");
        modScript.src = "http://localhost:8080/bundle.js";
        document.head.appendChild(modScript);

        console.log("Mythical Mod Loaded");
    }

    document.head.appendChild(cloudflareScript);
});
```
> Note: Make sure that the file URL directly links to the `bundle.js` on your local computer.

2. Start Local Private Server<br>
Simply open terminal and type out ``npx http-server ./dist --cors`` in the terminal.