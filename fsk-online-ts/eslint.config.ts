import globals from "globals";
import {Linter} from "eslint";
import tsEslint from "typescript-eslint";
import stylisticTs from "@stylistic/eslint-plugin";
// @ts-expect-error Project doesn't have declaration types
import pluginPromise from "eslint-plugin-promise"

export default [
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.eslintrc.*"]
    },
    {
        files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {...globals.browser, ...globals.node}
        },
        plugins: {"promise": pluginPromise},
        rules: {
            "no-warning-comments": "off",
            "brace-style": ["error", "1tbs"],
            "comma-dangle": "error",
            "curly": "error",
            "eol-last": "error",
            "eqeqeq": ["error", "smart"],
            "guard-for-in": "error",
            "max-len": ["error", {code: 140, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true}],
            "no-bitwise": "off",
            "no-caller": "error",
            "no-console": ["error", {
                allow: [
                    "trace", "log", "warn", "dir", "timeLog", "assert", "clear", "count", "countReset", "group", "groupEnd", "table",
                    "dirxml", "error", "groupCollapsed", "Console", "profile", "profileEnd", "timeStamp", "context"
                ]
            }],
            "no-debugger": "error",
            "no-empty": "error",
            "no-eval": "error",
            "no-fallthrough": "error",
            "no-new-wrappers": "error",
            "no-trailing-spaces": "error",
            "no-underscore-dangle": "off",
            "no-unused-labels": "error",
            "no-var": "error",
            "radix": "error",
            "spaced-comment": ["error", "always", {markers: ["/"]}],

            "id-blacklist": "off",
            "id-match": "off",

            "no-redeclare": "off",
            "no-shadow": "off",

            "promise/prefer-await-to-then": "warn"
        }
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsEslint.parser,
            parserOptions: {
                projectService: true,
                sourceType: "module",
                ecmaVersion: "latest"
            },
            globals: {...globals.browser, ...globals.node}
        },
        plugins: {"@typescript-eslint": tsEslint.plugin, "@stylistic/ts": stylisticTs},
        rules: {
            // your TS rules (kept from the old config)
            "@typescript-eslint/dot-notation": "error",
            "@typescript-eslint/explicit-member-accessibility": ["error", {
                accessibility: "explicit",
                overrides: {
                    accessors: "explicit",
                    constructors: "no-public",
                    methods: "explicit",
                    properties: "off",
                    parameterProperties: "explicit"
                }
            }],
            "@typescript-eslint/member-ordering": ["error", {
                default: [
                    "public-static-field", "protected-static-field", "private-static-field",
                    "public-instance-field", "protected-instance-field", "private-instance-field",
                    "public-static-method", "protected-static-method", "private-static-method",
                    "public-constructor", "protected-constructor", "private-constructor",
                    "public-instance-method", "protected-instance-method", "private-instance-method"
                ]
            }],
            "@typescript-eslint/naming-convention": ["error", {
                selector: "variable",
                format: ["camelCase", "PascalCase", "UPPER_CASE"]
            }],
            "@typescript-eslint/no-empty-function": "error",
            "@typescript-eslint/no-inferrable-types": "error",
            "@typescript-eslint/no-redeclare": "error",
            "@typescript-eslint/no-shadow": "error",
            "@typescript-eslint/no-unused-expressions": ["error", {allowTernary: true}],
            "@stylistic/ts/quotes": ["error", "double", {avoidEscape: true}],
            "@stylistic/ts/semi": ["error", "always"],
            "@stylistic/ts/type-annotation-spacing": "error",
            "@stylistic/ts/member-delimiter-style": ["error", {
                multiline: {delimiter: "semi", requireLast: true},
                singleline: {delimiter: "semi", requireLast: false}
            }]
        }
    }
] as const satisfies Linter.Config[];
