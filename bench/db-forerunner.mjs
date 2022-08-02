
import { promises as fsp } from 'fs';
import YAML from 'yaml';
import * as path from 'path';
import { default as ForerunnerDB } from 'forerunnerdb';
import { bench, run } from "mitata";

const fdb = new ForerunnerDB();

const db = fdb.db('akasharender' /* path.basename(config.configDir) */);
db.persist.dataDir('./cache');
const docs = db.collection('documents', { autoCreate: true });

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

    let results = docs.find({
        // As just described all three of these conditions
        // must be true for a match
        $or: [
            { vpath: { $eeq: fpath } },
            { renderPath: { $eeq: fpath } }
        ]
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


bench('search layouts using find w/ orderBy', async () => {

    const files = docs.find({
        docMetadata: {
            layout: { $in: [ 'page.html.ejs' ]}
        }
    }, {
        vpath: 1,
        $orderBy: { renderPath: 1 }
    });
});

bench('search layouts using find', async () => {
    const files = docs.find({
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





function dbpaths() {
    let paths = docs.find({
        $distinct: { vpath: 1 }
    }, { fspath: 1, vpath: 1, renderPath: 1 });

    const ret = [];
    for (let p of paths) {
        // console.log(p.path);
        // let info = this.find(p.vpath);
        ret.push({
            fspath: p.fspath,
            vpath: p.vpath,
            renderPath: p.renderPath
        });
    }
    return ret;
}


function siblings(_fpath) {
    let vpath = _fpath.startsWith('/')
                ? _fpath.substring(1)
                : _fpath;
    let dirname = path.dirname(vpath);
    if (dirname === '.') dirname = '/';
    let ret = docs.find({
        dirname: { $eeq: dirname },
        vpath: { $nee: vpath },
        renderPath: /\.html$/
    }, {
        $orderBy: { vpath: 1 }
    });
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
    const selector = {
        $or: [
            { renderPath: /\/index\.html$/ },
            { renderPath: /^index\.html$/ }
        ]
    };
    if (dirname !== '/') {
        selector.vpath = new RegExp(`^${dirname}`);
    }
    // console.log(selector);
    let ret = docs.find(selector, {
        $orderBy: { dirname: 1 }
    });
    return ret;
}
