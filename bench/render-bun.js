
import { bench, run } from "mitata";

// import * as ejs from 'ejs';

let people = ['geddy', 'neil', 'alex'];

// TEMPLATE STRINGS

bench('literal', () => { return `${people.join(', ')}`; });

// EJS

/* bench('ejs-join', () => {
    ejs.render('<%= people.join(", "); %>', { people: people });
});
bench('ejs-list', () => {
    ejs.render(`
    <ul>
    <% people.forEach(function (person) {
        %><li><%= person %></li><%
    }) %>
    </ul>
`, { people: people });
}); */

// HANDLEBARS

import Handlebars from "handlebars";

Handlebars.registerHelper("join", function(options) {
    return new Handlebars.SafeString(people.join(', '));
});

const templateJoin = Handlebars.compile(`
{{#join}}{{/join}}
`);
bench('handlers-join-once', () => {
    const output = templateJoin();
    // console.log(output);
});

const templateList = Handlebars.compile(`
<ul class="people_list">
{{#each people}}
        <li>{{this}}</li>
{{/each}}
</ul>
`);

bench('handlebars-list-once', () => {
    const output = templateList({ people: people });
});

// LIQUID

import { Liquid } from 'liquidjs';
const engine = new Liquid();

bench('liquid-join', async () => {
    const output = await engine.parseAndRender('{{ people | join: ", " }}', { people: people });
    // console.log(output);
});

bench(`liquid-list`, async () => {

    const output = await engine.parseAndRender(`
    <ul id="products">
    {% for person in people %}
        <li>{{ person }}</li>
    {% endfor %}
    </ul>
    `, { people: people });
    // console.log(output);
});

// NUNJUCKS

// import nunjucks from 'nunjucks';

/*
bench('nunjucks-join',  () => {
    const output = nunjucks.renderString('{{ people | join(", ") }}', { people: people });
    // console.log(output);
});

bench(`nunjucks-list`, () => {

    const output = nunjucks.renderString(`
    <ul id="products">
    {% for person in people %}
        <li>{{ person }}</li>
    {% endfor %}
    </ul>
    `, { people: people });
    // console.log(output);
});
*/


// MARKDOWN

/* import { promises as fsp } from 'fs';
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
    highlight: function (/*str, , lang* /) { return ''; }
};
const md = MarkdownIt(mditConfig);
const doc1 = await fsp.readFile('fixtures/document.md', 'utf-8');

bench('markdown-render',  () => {
    const output = md.render(doc1);
    // console.log(output);
}); */


try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }
