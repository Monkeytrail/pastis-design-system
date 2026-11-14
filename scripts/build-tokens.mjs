// Flattens src/tokens/index.css (resolving local @imports) into dist/pastis-tokens.css
// so consumers can load every token from one stylesheet.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function inline(file) {
  return readFileSync(file, 'utf8').replace(
    /@import\s+['"](\.[^'"]+)['"];/g,
    (_, rel) => inline(resolve(dirname(file), rel)),
  );
}

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/pastis-tokens.css'), inline(resolve(root, 'src/tokens/index.css')));
console.log('Built dist/pastis-tokens.css');
