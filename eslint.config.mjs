import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const ignoreTargetConfig = {
  // ESLint のチェック対象外 (node_modules と .git はデフォルトで対象外)
  ignores: ["dist/", ".turbo/", "*.mjs", "public/", "benchmarker/**"],
};

// strict と stylistic に含まれないルールを追加する
const tseslintCustomConfig = {
  plugins: { "typescript-eslint": tseslint },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/strict-boolean-expressions": [
      "error",
      {
        allowNumber: false,
        allowString: false,
        allowNullableObject: false,
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
      },
    ],
  },
};

export default tseslint.config([
  ignoreTargetConfig,
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs", "*.mts"],
        },
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  tseslintCustomConfig,
]);
