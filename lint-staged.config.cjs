module.exports = {
  '**/*.{js,jsx,ts,tsx,mjs,cjs}': (filenames) => [
    `pnpm eslint --fix ${filenames.join(' ')}`,
    `pnpm prettier --write ${filenames.join(' ')}`
  ]
}
