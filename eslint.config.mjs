import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  {
    files: ["**/*.{ts}"],
    ignores: ["**/node_modules/", "**/dist/", "**/tests/"],
  },
];
