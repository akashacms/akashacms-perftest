
/*
$ node file-cache.mjs 
Config start
Prepared config
documents 1211
assets 78
layouts 15
partials 118
cpu: Intel(R) Core(TM) i7-5600U CPU @ 2.60GHz
runtime: node v18.6.0 (x64-linux)

benchmark                      time (avg)             (min … max)
-----------------------------------------------------------------
paths                        94.3 ms/iter   (92.14 ms … 98.18 ms)
random find                  4.14 ms/iter    (3.76 ms … 12.76 ms)
random siblings              2.92 ms/iter     (1.95 ms … 7.64 ms)
random indexes               8.25 ms/iter    (7.73 ms … 10.98 ms)
search layouts                5.25 s/iter          (5 s … 5.83 s)
search layouts using find   92.97 ms/iter  (86.81 ms … 113.61 ms)
*/

/*
 * OBSERVATIONS ON RESULTS ABOVE
 *
 * It took slightly less than 3 seconds to load everything initially, which is good.
 * 
 * Every one of these results is astonishingly slow.
 * 
 * The "Search layouts" case passes a single item, which the search function converts
 * into a Selector.  The operation also requests Forerunner to sort the results.  That means
 * it is going to retrieve then sort about 1211 documents.  This is the cause for the
 * long execution time on that scenario.
 * 
 * The equivalent using find does not request the sorting, so that's a significant part
 * of the cost.  Even so, 92ms is extraordinarily long.
 */ 

import * as util from 'util';
import { default as chokidar } from 'chokidar';
// import { DirsWatcher } from '@akashacms/stacked-dirs';
import { bench, run } from "mitata";

import * as ForerunnerCache from 'akasharender/cache/cache-forerunner.mjs';
import * as FileCache from 'akasharender/cache/file-cache.mjs';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config');

// 1. Use akasharender/cache/file-cache.mjs to read and store data for a directory tree
// 2. Run various queries on the cache

// 3. Repeat using LokiJS - https://github.com/techfort/LokiJS

// console.log(`filecache setup documents ${util.inspect(config.documentDirs)}`);
// console.log(`filecache setup assets ${util.inspect(config.assetDirs)}`);
// console.log(`filecache setup layouts ${util.inspect(config.layoutDirs)}`);
// console.log(`filecache setup partials ${util.inspect(config.partialsDirs)}`);

await ForerunnerCache.setup(config);
// await FileCache.setup(config);

// Mimicing AKASHARENDER.cacheSetupComplete
await Promise.all([
    FileCache.setupDocuments(config),
    FileCache.setupAssets(config),
    FileCache.setupLayouts(config),
    FileCache.setupPartials(config),
    config.hookPluginCacheSetup()
]);

/* FileCache.documents.on('add', (collection, info) => {
    console.log(`documents add ${util.inspect(collection)} ${util.inspect(info)}`);
});
FileCache.documents.on('change', (collection, info) => {
    console.log(`documents change ${util.inspect(collection)} ${util.inspect(info)}`);
}); */

await Promise.all([
    FileCache.documents.isReady(),
    FileCache.assets.isReady(),
    FileCache.layouts.isReady(),
    FileCache.partials.isReady()
]);

console.log(`documents ${(await FileCache.documents).paths().length}`);
console.log(`assets ${(await FileCache.assets).paths().length}`);
console.log(`layouts ${(await FileCache.layouts).paths().length}`);
console.log(`partials ${(await FileCache.partials).paths().length}`);

bench('paths', async () => {
    const paths = (await FileCache.documents).paths();
});

const docpaths = (await FileCache.documents).paths();

bench('random find', async () => {
    const item = docpaths[Math.floor(Math.random()*docpaths.length)];
    const info = (await FileCache.documents).find(item.vpath);
});

bench('random siblings', async () => {
    const item = docpaths[Math.floor(Math.random()*docpaths.length)];
    const info = (await FileCache.documents).siblings(item.vpath);
});

const indexDirs = [
    'docs01',
    'docs02',
    'docs03',
    'docs04',
    'docs05',
    'docs06',
    'docs07',
    'docs08',
    'docs09',
    'docs10'
];

bench('random indexes', async () => {
    const item = indexDirs[Math.floor(Math.random()*indexDirs.length)];
    const info = (await FileCache.documents).indexFiles(item.vpath);
});

bench('search layouts', async () => {
    const files = (await FileCache.documents).search(config, {
        layouts: 'page.html.ejs'
    });
});

bench('search layouts using find', async () => {
    const coll = (await FileCache.documents).getCollection((await FileCache.documents).collection);
    const files = coll.find(config, {
        docMetadata: {
            layout: { $in: [ 'page.html.ejs' ]}
        }
    });
});

try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }

await Promise.all([
    FileCache.documents.close(),
    FileCache.assets.close(),
    FileCache.layouts.close(),
    FileCache.partials.close()
]);
