

import * as path from 'path';
import { promises as fsp } from 'fs';
import { assets } from './assets.mjs';
import { bench, run } from "mitata";

bench('copy-assets', async () => {
    for (let fileInfo of assets) {
        const outdir = path.join('out', fileInfo.mountPoint);
        await fsp.mkdir(outdir, { recursive: true });
        const outfile = path.join('out', fileInfo.vpath);
        await fsp.copyFile(fileInfo.fspath, outfile);
    }
});

try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }
