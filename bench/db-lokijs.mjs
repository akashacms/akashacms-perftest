
/*
$ node db-lokijs.mjs 
cpu: Intel(R) Core(TM) i7-5600U CPU @ 2.60GHz
runtime: node v18.6.0 (x64-linux)

benchmark                  time (avg)             (min … max)
-------------------------------------------------------------
paths                    1.08 ms/iter  (690.28 µs … 12.81 ms)
random find             94.17 µs/iter  (69.36 µs … 469.62 µs)
random siblings         85.56 µs/iter    (42.49 µs … 4.43 ms)
random indexes         133.56 µs/iter    (113.1 µs … 1.56 ms)
search layouts         283.03 µs/iter   (198.45 µs … 1.27 ms)
search layouts sorted     1.3 ms/iter   (883.28 µs … 3.62 ms)
*/

/*
 * OBSERVATIONS - THIS IS FAST!!!!!
 */

import { promises as fsp } from 'fs';
import YAML from 'yaml';
import * as path from 'path';
import * as util from 'util';
import { bench, run } from "mitata";
import loki from 'lokijs';

const db = new loki('example.db');
const docs = db.addCollection('documents');


const data = await fsp.readFile('file-data.yml', 'utf8');
const ydata = YAML.parse(data);

for (const doc of ydata.docs) {
    docs.insert(doc);
}


bench('paths', async () => {
    const paths = dbpaths();
});


const docpaths = dbpaths();

bench('random find', async () => {
    const item = docpaths[Math.floor(Math.random()*docpaths.length)];

    let fpath = item.vpath.startsWith('/')
                ? item.vpath.substring(1)
                : item.vpath;

    let results = docs.where(function(obj) {
        return obj.vpath === fpath || obj.renderPath === fpath;
    });
    let ret;
    if (results.length > 0) {
        ret = results[0];
    } else ret = results;
});


bench('random siblings', async () => {
    const item = docpaths[Math.floor(Math.random()*docpaths.length)];
    const info = siblings(item.vpath);
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
    const info = indexFiles(item);
});


bench('search layouts', async () => {
    const files = findLayout([ 'page.html.ejs' ]);
});

bench('search layouts sorted', async () => {
    const files = findLayoutSorted([ 'page.html.ejs' ]);
});


try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }





function dbpaths() {
    const vpathsSeen = new Set();
    const ret = docs.chain()
    .map(function(obj) {
        return {
            fspath: obj.fspath,
            vpath: obj.vpath,
            renderPath: obj.renderPath
        };
    })
    .where(function(obj) {
        if (vpathsSeen.has(obj.vpath)) {
            return false;
        } else {
            vpathsSeen.add(obj.vpath);
            return true;
        }
    })
    .data()
    .map(obj => {
        return  {
            fspath: obj.fspath,
            vpath: obj.vpath,
            renderPath: obj.renderPath
        };
    });

    // console.log(`dbpaths ${ret.length}`);
    // console.log(`dbpaths ${util.inspect(ret)}`);

    return ret;
}


function siblings(_fpath) {
    let vpath = _fpath.startsWith('/')
                ? _fpath.substring(1)
                : _fpath;
    let dirname = path.dirname(vpath);
    if (dirname === '.') dirname = '/';

    let ret = docs.chain()
    .where(function(obj) {
        return obj.dirname === dirname
           &&  obj.vpath !== vpath
           &&  obj.renderPath.endsWith('.html');
           
    })
    .simplesort('vpath')
    .data();

    return ret;
}


function indexFiles(_dirname) {
    let dirname = _dirname && _dirname.startsWith('/')
                ? _dirname.substring(1)
                : _dirname;
    if (dirname === '.'
     || dirname === ''
     || typeof dirname === 'undefined') {
        dirname = '/';
    }

    let ret = docs.chain()
    .where(function(obj) {
        const renderP = obj.renderPath === 'index.html' || obj.renderPath.endsWith('/index.html');
        if (!renderP) return false;
        if (dirname !== '/') {
            if (obj.vpath.startsWith(dirname)) return true;
            else return false;
        } else {
            return true;
        }
    })
    .simplesort('dirname')
    .data();
    // console.log(`indexFiles ${ret.length}`);
    return ret;
}

function findLayout(layout) {
    let ret = docs.chain()
    .where(function(obj) {
        if (obj.vpath
         && obj.docMetadata
         && layout.includes(obj.docMetadata.layout)) {
            return true;
        } else {
            return false;
        }
    })
    .data();
    return ret;
}

function findLayoutSorted(layout) {
    let ret = docs.chain()
    .where(function(obj) {
        if (obj.vpath
         && obj.docMetadata
         && layout.includes(obj.docMetadata.layout)) {
            return true;
        } else {
            return false;
        }
    })
    .simplesort('renderPath')
    .data();
    return ret;
}