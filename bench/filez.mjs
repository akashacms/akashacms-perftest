
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./config.js');

// import { config } from './config.mjs';

import { inspect } from 'util';

import { default as chokidar } from 'chokidar';
import { DirsWatcher } from '@akashacms/stacked-dirs';
import { bench, run } from "mitata";

console.log(inspect(config));

const dirz = config.assetDirs
        .concat(config.documentDirs)
        .concat(config.layoutDirs)
        .concat(config.partialsDirs)
        .map(dir => {

            if (typeof dir === 'string') {
                return dir;
            } else {
                return dir.src;
            }
        });

bench('chokidar', async () => {
    await new Promise((resolve, reject) => {
        try {
            let watcher = chokidar.watch(dirz);
            watcher
            .on('error', async (error) => {
                console.error(error);
                reject(error);
            })
            .on('add', (fpath, stats) => {
                // console.log(`add ${fpath} ${inspect(stats)}`);
            })
            .on('change', (fpath, stats) => {
                // console.log(`change ${fpath} ${inspect(stats)}`);
            })
            .on('ready', async () => {
                // console.log(`ready`);
                await watcher.close();
                watcher = undefined;

                resolve();
            });
        } catch (err) { reject(err); }
    });

});

const dirz2 = dirz.map(dir => {
    return {
        mounted: dir,
        mountPoint: '/'
    }
});

bench('dirsWatcher', async () => {
    let docsWatcher = new DirsWatcher('documents');

    await new Promise((resolve, reject) => {
    
        try {
            docsWatcher.on('ready', async (name) => {
                // console.log(`documents ready ${name}`);
                await close();
            })
            /* .on('change', async (name, info) => {
                console.log(`documents change ${name} ${info.vpath}`, info);
            }) */
            .on('add', async (name, info) => {
                // console.log(`documents add ${name} ${info.vpath}`, info);
                // count++;
            });
            
            docsWatcher.watch(dirz2);
                
            async function close() {
                await docsWatcher.close();
                docsWatcher = undefined;
                resolve();
            }
        } catch(errr) { reject(errr); }
    
    });
    
});

try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }
