module.exports = {
 // Run ESLint on JS, TS, JSX, and TSX files
 "**/*.{js,jsx,ts,tsx}": ["eslint --max-warnings=0"],

 // Format JS, TS, JSX, TSX, CSS, MD, and JSON files with Prettier
 "**/*.{js,jsx,ts,tsx,css,md,json}": ["prettier --write"],

 // Note: We're commenting out the TypeScript check to allow commits with type errors for now
 // This should be uncommented later once the existing type issues are fixed
 "**/*.ts?(x)": () => "tsc --noEmit",
};
