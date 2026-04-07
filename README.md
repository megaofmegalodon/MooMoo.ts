# MooMoo.ts

A modern, TypeScript-based implementation of MooMoo.io's frontend.
This repo provides a clean and type-safe alternative for modding.
The perfect boilerplate for developers looking to build their own clients for the game.
> Note: Although all the core features have already been ported to TypeScript,
some features (e.g. mobile support, lockDir/aim locking, etc) are currently missing.

# Getting Started

## For TypeScript developers
If you prefer working with types and modern syntax:
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
Because TypeScript's compiles down to JavaScript,
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

4. Source Directory
Replace the current source directory with the transpiled JS.