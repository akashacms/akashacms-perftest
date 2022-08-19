
import { bench, run } from "mitata";
import { promises as fsp } from 'fs';

let people = ['geddy', 'neil', 'alex'];

// TEMPLATE STRINGS

bench('literal', () => { return `${people.join(', ')}`; });
bench('literal list', () => {
    const ret = `
    <ul>
    ${people.map(person => {
        return `<li>${person}</li>`
    })}
    </ul>
`;
    // console.log(ret);
    return ret;
});

// EJS

import * as ejs from 'ejs';

const ejsContent = await fsp.readFile('./fixtures/ejs-content.ejs', 'utf-8');

bench('ejs-join', () => {
    ejs.render('<%= people.join(", "); %>', { people: people });
});
bench('ejs-list', () => {
    ejs.render(ejsContent, { people: people });
});

const ejsContentTemplate = ejs.compile(ejsContent);
bench('ejs-list-template', () => {
    ejsContentTemplate({ people: people });
});

const ejsPage = await fsp.readFile('./fixtures/ejs-page.ejs', 'utf-8');
const ejsFooter = await fsp.readFile('./fixtures/ejs-footer.ejs', 'utf-8');

const ejsPageTemplate = ejs.compile(ejsPage);
const ejsFooterTemplate = ejs.compile(ejsFooter);

bench('ejs-page', () => {
    const content = ejs.render(ejsContent, { people: people });
    const footer = ejs.render(ejsFooter, {
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    ejs.render(ejsPage, {
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});

bench('ejs-page-template', () => {
    const content = ejsContentTemplate({ people: people });
    const footer = ejsFooterTemplate({
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    ejsPageTemplate({
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});

// HANDLEBARS

import Handlebars from "handlebars";

const hbarsContent = await fsp.readFile('./fixtures/handlebars-list.handlebars', 'utf-8');
const hbarsPage = await fsp.readFile('./fixtures/handlebars-page.handlebars', 'utf-8');
const hbarsFooter = await fsp.readFile('./fixtures/handlebars-footer.handlebars', 'utf-8');

Handlebars.registerHelper("join", function(options) {
    return new Handlebars.SafeString(people.join(', '));
});

const templateJoin = Handlebars.compile(`
{{#join}}{{/join}}
`);
bench('handlebars-join', () => {
    const output = templateJoin();
    // console.log(output);
});

const hBarsTemplateList = Handlebars.compile(hbarsContent);

bench('handlebars-list', () => {
    const output = hBarsTemplateList({ people: people });
});

const hBarsTemplateFooter = Handlebars.compile(hbarsFooter);
const hBarsTemplatePage = Handlebars.compile(hbarsPage);

bench('handlebars-page', () => {
    const content = hBarsTemplateList({ people: people });
    const footer = hBarsTemplateFooter({
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    hBarsTemplatePage({
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});


// LIQUID

import { Liquid } from 'liquidjs';
const engine = new Liquid();

const liquidContent = await fsp.readFile('./fixtures/liquid-list.liquid', 'utf-8');
const liquidPage = await fsp.readFile('./fixtures/liquid-page.liquid', 'utf-8');
const liquidFooter = await fsp.readFile('./fixtures/liquid-footer.liquid', 'utf-8');


bench('liquid-join', async () => {
    const output = await engine.parseAndRender('{{ people | join: ", " }}', { people: people });
    // console.log(output);
});

bench(`liquid-list`, async () => {
    const output = await engine.parseAndRender(liquidContent, { people: people });
    // console.log(output);
});

bench('liquid-page', async () => {
    const content = await engine.parseAndRender(liquidContent, { people: people });
    const footer = await engine.parseAndRender(liquidFooter, {
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    await engine.parseAndRender(liquidPage, {
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});


// NUNJUCKS

import nunjucks from 'nunjucks';

const njkContent = await fsp.readFile('./fixtures/nunjucks-list.njk', 'utf-8');
const njkPage = await fsp.readFile('./fixtures/nunjucks-page.njk', 'utf-8');
const njkFooter = await fsp.readFile('./fixtures/nunjucks-footer.njk', 'utf-8');

let njkContentTemplate;
let njkPageTemplate;
let njkFooterTemplate;
try {
    njkContentTemplate = nunjucks.compile(njkContent);
    njkPageTemplate = nunjucks.compile(njkPage);
    njkFooterTemplate = nunjucks.compile(njkFooter);
} catch (err) { }
bench('nunjucks-join',  () => {
    const output = nunjucks.renderString('{{ people | join(", ") }}', { people: people });
    // console.log(output);
});

bench(`nunjucks-list`, () => {
    const output = nunjucks.renderString(njkContent, { people: people });
    // console.log(output);
});

bench(`nunjucks-list-template`, () => {
    const output = njkContentTemplate.render({ people: people });
    // console.log(output);
});

bench('nunjucks-page', async () => {
    const content = nunjucks.renderString(njkContent, { people: people });
    const footer = nunjucks.renderString(njkFooter, {
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    nunjucks.renderString(njkPage, {
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});

bench('nunjucks-page-template', async () => {
    const content = njkContentTemplate.render({ people: people });
    const footer = njkFooterTemplate.render({
        branding: 'Formatted with <a href="https://example.com">ExampleCMS</a>'
    });
    njkPageTemplate.render({
        title: 'Test page for performance benchmarks',
        content: content,
        footer: footer
    });
});

// LESSCSS

import less from 'less';

const lessCSS = await fsp.readFile('./fixtures/style.css.less', 'utf-8');

bench('less-css', async () => {
    await less.render(lessCSS);
    /* await new Promise((resolve, reject) => {
        less.render(lessCSS,  function (err, css) {
            if (err) reject(err);
            else     resolve(css);
        });
    }); */
});

// MARKDOWN

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
const doc1 = await fsp.readFile('fixtures/document.md', 'utf-8');
const doc2 = await fsp.readFile('fixtures/markdown.md', 'utf-8');

bench('markdown-render-simple',  () => {
    const output = md.render(doc1);
    // console.log(output);
});

bench('markdown-render-test-suite',  () => {
    const output = md.render(doc2);
    // console.log(output);
});

// ASCIIDOCTOR

/*
import { default as AsciiDoctor } from '@asciidoctor/core';
const asciidoctor = AsciiDoctor();
const adoc1 = await fsp.readFile('fixtures/asciidoctor.adoc', 'utf-8');

bench('asciidoctor-render-test-suite',  () => {
    const output = asciidoctor.convert(adoc1, {});
    // console.log(output);
});
*/

// CHEERIO

const html1 = md.render(doc1);
const html2 = md.render(doc2);

import * as cheerio from 'cheerio';

bench('cheerio-simple', () => {
    const $ = cheerio.load(html1, {
        recognizeSelfClosing: true,
        recognizeCDATA: true,
        decodeEntities: true,
        _useHtmlParser2: true
    });

    $('a').each(function(i, elem) {
        $(elem).attr('rel', 'nofollow');
    });
    $('li').addClass('index-item');
    const html = $.html();
    // console.log(html);
});

bench('cheerio-test-suite', () => {
    const $ = cheerio.load(html2, {
        recognizeSelfClosing: true,
        recognizeCDATA: true,
        decodeEntities: true,
        _useHtmlParser2: true
    });

    $('a').each(function(i, elem) {
        $(elem).attr('rel', 'nofollow');
    });
    $('li').addClass('index-item');
    const html = $.html();
    // console.log(html);
});

/**
 * Next, should be able to directly call AkashaCMS functions to render individual files
 */


try {
    await run({
        percentiles: false
    });
} catch (err) { console.error(err); }
