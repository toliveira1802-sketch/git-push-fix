import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Force resolve tailwindcss from local node_modules (v3), not root (v4)
const localTailwind = require(path.join(__dirname, 'node_modules', 'tailwindcss'));

export default {
  plugins: [
    localTailwind,
    (await import('autoprefixer')).default,
  ],
};
