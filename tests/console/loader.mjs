/**
 * Zero-dependency Node module-resolution hook for the Founder Console tests.
 *
 * The domain source uses the `@/*` path alias and extensionless imports (the
 * bundler resolves them). Node's ESM loader does neither, so this hook maps
 * `@/x` to `<cwd>/src/x` and resolves extensionless specifiers to `.ts` /
 * `.tsx` / index files. Type-only imports are removed by Node's native type
 * stripping before resolution, so they never reach this hook.
 */

import { existsSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const SRC = path.resolve("src")

function isFile(p) {
  try {
    return statSync(p).isFile()
  } catch {
    return false
  }
}

function resolveFile(basePath) {
  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    basePath,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ]
  return candidates.find((c) => existsSync(c) && isFile(c)) ?? null
}

export async function resolve(specifier, context, nextResolve) {
  let target = null

  if (specifier.startsWith("@/")) {
    target = path.join(SRC, specifier.slice(2))
  } else if (
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    context.parentURL?.startsWith("file:")
  ) {
    const parentPath = fileURLToPath(context.parentURL)
    target = path.resolve(path.dirname(parentPath), specifier)
  }

  if (target) {
    const file = resolveFile(target)
    if (file) {
      return { url: pathToFileURL(file).href, shortCircuit: true }
    }
  }

  return nextResolve(specifier, context)
}
