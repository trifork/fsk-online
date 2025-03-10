const path = require("path");

module.exports = {
    "env": {
        "browser": true,
        "node": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": path.join(__dirname, "tsconfig.json"),
        "sourceType": "module",
        "createDefaultProgram": true
    },
    "plugins": [
        "@typescript-eslint",
        "promise"
    ],
    "rules": {
        "promise/always-return": "error",
        "promise/no-return-wrap": "error",
        "promise/param-names": "error",
        "promise/catch-or-return": "error",
        "promise/no-native": "off",
        "promise/no-nesting": "warn",
        "promise/no-promise-in-callback": "warn",
        "promise/no-callback-in-promise": "warn",
        "promise/avoid-new": "warn",
        "promise/no-new-statics": "error",
        "promise/no-return-in-finally": "warn",
        "promise/valid-params": "warn",
        "promise/prefer-await-to-then": "warn",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/explicit-member-accessibility": [
            "error",
            {
                "accessibility": "explicit",
                "overrides": {
                    "accessors": "explicit",
                    "constructors": "no-public",
                    "methods": "explicit",
                    "properties": "off",
                    "parameterProperties": "explicit"
                }
            }
        ],
        "@typescript-eslint/indent": "error",
        "@typescript-eslint/member-delimiter-style": [
            "error",
            {
                "multiline": {
                    "delimiter": "semi",
                    "requireLast": true
                },
                "singleline": {
                    "delimiter": "semi",
                    "requireLast": false
                }
            }
        ],
        "@typescript-eslint/member-ordering": [
            "error",
            {
                "default": [
                    "public-static-field",
                    "protected-static-field",
                    "private-static-field",
                    "public-instance-field",
                    "protected-instance-field",
                    "private-instance-field",
                    "public-static-method",
                    "protected-static-method",
                    "private-static-method",
                    "public-constructor",
                    "protected-constructor",
                    "private-constructor",
                    "public-instance-method",
                    "protected-instance-method",
                    "private-instance-method"
                ]
            }
        ],
        "@typescript-eslint/naming-convention": [
            "error",
            {
                "selector": "variable",
                "format": [
                    "camelCase",
                    "PascalCase",
                    "UPPER_CASE"
                ]
            }
        ],
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-unused-expressions": ["error", { "allowTernary": true }],
        "@typescript-eslint/quotes": [
            "error",
            "double",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ],
        "@typescript-eslint/semi": [
            "error",
            "always"
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "brace-style": [
            "error",
            "1tbs"
        ],
        "comma-dangle": "error",
        "curly": "error",
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": "off",
        "id-match": "off",
        "max-len": [
            "error",
            {
                "code": 140,
                "ignoreStrings": true,
                "ignoreComments": true,
                "ignoreTemplateLiterals": true
            }
        ],
        "no-bitwise": "off",
        "no-caller": "error",
        "no-console": [
            "error",
            {
                "allow": [
                    "log",
                    "warn",
                    "dir",
                    "timeLog",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupEnd",
                    "table",
                    "dirxml",
                    "error",
                    "groupCollapsed",
                    "Console",
                    "profile",
                    "profileEnd",
                    "timeStamp",
                    "context"
                ]
            }
        ],
        "no-debugger": "error",
        "no-empty": "error",
        "no-eval": "error",
        "no-fallthrough": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "@typescript-eslint/no-shadow": "error",
        "no-shadow": "off",
        "no-trailing-spaces": "error",
        "no-underscore-dangle": "off",
        "no-unused-labels": "error",
        "no-var": "error",
        "radix": "error",
        "spaced-comment": [
            "error",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ]
    }
};
