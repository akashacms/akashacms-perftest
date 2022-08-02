

import * as ForerunnerCache from 'akasharender/cache/cache-forerunner.mjs';
import * as FileCache from 'akasharender/cache/file-cache.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config');

import YAML from 'yaml';
import { promises as fsp } from 'fs';


await ForerunnerCache.setup(config);
// await FileCache.setup(config);

// Mimicing AKASHARENDER.cacheSetupComplete
await Promise.all([
    FileCache.setupDocuments(config)
]);

await Promise.all([
    FileCache.documents.isReady()
]);

const paths = FileCache.documents.paths();

const docs = {
    docs: []
};

for (const p of paths) {
    const info = FileCache.documents.find(p.vpath);
    docs.docs.push(info);
}

await fsp.writeFile('file-data.yml', YAML.stringify(docs), 'utf8');

await FileCache.documents.close();

