
const path = require('path');
const fsp = require('fs/promises');
const assets = require('./assets.js');
const { bench, run } = require("mitata");

bench(`copy-files`, async () => {
    for (let fileInfo of assets) {
        const outdir = path.join('out', fileInfo.mountPoint);
        await fsp.mkdir(outdir, { recursive: true });
        const outfile = path.join('out', fileInfo.vpath);
        await fsp.cp(fileInfo.fspath, outfile);
    }
});

(async () => {
    await run({
        percentiles: false
    });
})().catch(err => { console.error(err); })
