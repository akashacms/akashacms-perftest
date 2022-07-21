
let people = ['geddy', 'neil', 'alex'];

/*
import * as ejs from 'ejs';

console.log(ejs.render('<%= people.join(", "); %>', {people: people}));
*/

/* 
import nunjucks from 'nunjucks';

const output = nunjucks.renderString('{{ people | join(", ") }}', { people: people });

console.log(output);
*/


import MarkdownIt from 'markdown-it';

const mditConfig = {
    html:         true,         // Enable html tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    // langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      true,         // Autoconvert url-like texts to links
    typographer:  false,        // Enable smartypants and other sweet transforms
  
    // Highlighter function. Should return escaped html,
    // or '' if input not changed
    highlight: function (/*str, , lang*/) { return ''; }
};
const md = MarkdownIt(mditConfig);
// const doc1 = await fsp.readFile('fixtures/document.md', 'utf-8');

const doc1 = `
# Title 1

Some text [with a link](http://somewhere.com)

## Title 2

* Person 1
* Person 2
* Person 3
`;

const output = md.render(doc1);
console.log(output);
