import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        rules: {
            // Rules that are now fixed and should be errors
            "@typescript-eslint/no-empty-object-type": "error",
            "@typescript-eslint/no-require-imports": "error",
            "@next/next/no-html-link-for-pages": "error",

            // Rules that still need work and are temporarily warnings
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "react/no-unescaped-entities": "warn"
        }
    }
];

export default eslintConfig;
