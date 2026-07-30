import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const README_PATH = fileURLToPath(new URL('../README.md', import.meta.url));
const PACKAGE_JSON_PATH = fileURLToPath(new URL('../package.json', import.meta.url));

function readReadme(): string {
  return readFileSync(README_PATH, 'utf8');
}

interface PackageJson {
  scripts: Record<string, string>;
}

function readPackageJson(): PackageJson {
  return JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as PackageJson;
}

describe('README.md', () => {
  test('has the expected title and top-level sections', () => {
    const readme = readReadme();

    expect(readme).toMatch(/^# Equipment Inventory/);
    expect(readme).toMatch(/^## Stack/m);
    expect(readme).toMatch(/^## Running it locally/m);
    expect(readme).toMatch(/^## Scripts/m);
    expect(readme).toMatch(/^## Env vars/m);
    expect(readme).toMatch(/^## Gotcha worth knowing/m);
  });

  test('every "npm run <script>" reference points at a real package.json script', () => {
    const readme = readReadme();
    const { scripts } = readPackageJson();

    const documentedRunScripts = [...readme.matchAll(/`npm run ([\w:.-]+)`/g)].map(
      (match) => match[1],
    );
    expect(documentedRunScripts.length).toBeGreaterThan(0);

    for (const scriptName of documentedRunScripts) {
      expect(Object.keys(scripts), `README references unknown script "${String(scriptName)}"`).toContain(
        scriptName,
      );
    }
  });

  test('the documented typecheck command matches the package.json script', () => {
    const readme = readReadme();
    const { scripts } = readPackageJson();

    const typecheckRow = /\| `npm run typecheck`\s*\|\s*`([^`]+)`/.exec(readme);
    expect(typecheckRow?.[1]).toBe(scripts.typecheck);
  });

  test('documents the local setup steps in order', () => {
    const readme = readReadme();

    const setupBlockMatch = /```\nnpm install\ncopy \.env\.example \.env\nnpm run db:up\nnpm run db:seed\n```/.exec(
      readme,
    );
    expect(setupBlockMatch).not.toBeNull();
  });

  test('warns that db/init.sql only runs against a fresh volume', () => {
    const readme = readReadme();

    expect(readme).toContain('`db/init.sql` only runs when the Docker volume is brand new.');
    expect(readme).toContain('docker compose down -v');
  });
});