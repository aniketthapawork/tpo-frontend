
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
// import tseslint from "typescript-eslint"; // Removed

export default [ // Adjusted to array syntax for ESLint flat config
  { ignores: ["dist"] },
  {
    // extends: [js.configs.recommended, ...tseslint.configs.recommended], // Modified
    files: ["**/*.{js,jsx}"], // Changed from ts,tsx
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { // Added for JSX
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // "@typescript-eslint/no-unused-vars": "off", // Removed
      "no-unused-vars": "warn", // Added basic JS unused vars
    },
  }
];

