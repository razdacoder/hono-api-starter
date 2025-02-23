// Run this command to generate base config and vs code settings:
// pnpm dlx @antfu/eslint-config@latest

import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "app",
    typescript: true,
    stylistic: {
      indent: 2,
      semi: true,
      quotes: "double",
    },
  },
  {
    ignores: ["@/db/migrations/"],
    rules: {
      "no-console": ["warn"],
      "antfu/no-top-level-await": ["off"],
      "node/prefer-global/process": ["off"],
      "node/no-process-env": ["error"],
      "style/comma-dangle": ["off"],
      "style/brace-style": ["off"],

      "perfectionist/sort-imports": [
        "error",
        {
          internalPattern: ["@/**"],
        },
      ],
      // "unicorn/filename-case": [
      //   "error",
      //   {
      //     case: "kebabCase",
      //     ignore: ["README.md"],
      //   },
      // ],
    },
  }
);
