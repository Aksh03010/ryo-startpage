import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const aliases = {
  react: 'preact/compat',
  'react-dom': 'preact/compat',
  'react-dom/client': 'preact/compat/client',
  'react/jsx-runtime': 'preact/jsx-runtime',
};
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (aliases[specifier]) return nextResolve(aliases[specifier], context);
    if (specifier.endsWith('.css'))
      return {
        url: 'data:text/javascript,export default new Proxy({}, {get: (_, key) => String(key)})',
        shortCircuit: true,
      };
    if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      const url = new URL(specifier, context.parentURL);
      for (const suffix of ['.ts', '.tsx']) {
        if (existsSync(fileURLToPath(url) + suffix))
          return { url: url.href + suffix, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url)) {
      (globalThis.__loadedSources ??= new Set()).add(url);
      const source = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2023,
          jsx: ts.JsxEmit.ReactJSX,
        },
        fileName: fileURLToPath(url),
      }).outputText;
      return { format: 'module', source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
