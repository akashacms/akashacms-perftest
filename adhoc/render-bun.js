
import { bench, run } from "mitata";

import * as ejs from 'ejs';

let people = ['geddy', 'neil', 'alex'];

bench('literal', () => { return `${people.join(', ')}`; });

bench("ejs", () => {
    ejs.render('<%= people.join(", "); %>', {people: people});
});
try {
    await run();
} catch (err) { console.error(err); }
