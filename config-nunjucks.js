
'use strict';

const akasha  = require('akasharender');
const mahabhuta = akasha.mahabhuta;
const path    = require('path');
const util    = require('util');

const config = new akasha.Configuration();

config.rootURL("https://perftest.akashacms.com");

config.configDir = __dirname;

config
    .addAssetsDir('assets')
    .addAssetsDir({
        src: 'node_modules/bootstrap/dist',
        dest: 'vendor/bootstrap'
    })
   .addAssetsDir({
        src: 'node_modules/jquery/dist',
        dest: 'vendor/jquery'
    })
    .addAssetsDir({
        src: 'node_modules/popper.js/dist',
        dest: 'vendor/popper.js'
    })
    .addLayoutsDir('layouts')
    .addDocumentsDir('documents')
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs01' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs02' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs03' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs04' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs05' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs06' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs07' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs08' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs09' })
    .addDocumentsDir({ src: 'docs100-nunjucks', dest: 'docs10' })
    .addPartialsDir('partials');

config
    .use(require('@akashacms/theme-bootstrap'))
    .use(require('@akashacms/plugins-base'), {
        generateSitemapFlag: true
    })
    .use(require('@akashacms/plugins-breadcrumbs'))
    .use(require('@akashacms/plugins-booknav'))
    .use(require('@akashacms/plugins-authors'), {
        default: "boygeorge",
        authors: [
            {
                code: "boygeorge",
                fullname: "Boy George",
                url: "URL",
                bio: "<p>Weird ass british rocker</p>"
            },
            {
                code: "eltonjohn",
                fullname: "Elton John",
                url: "URL",
                bio: "<p>Mainstream british rocker</p>"
            }
        ]
    })
    .use(require('akashacms-dlassets'))
    .use(require('@akashacms/plugins-document-viewers'))
    .use(require('@akashacms/plugins-embeddables'))
    .use(require('akashacms-external-links'))
    .use(require('@akashacms/plugins-footnotes'))
    .use(require('akashacms-affiliates'))
    .use(require('@akashacms/plugins-tagged-content'), {
        sortBy: 'title',
        // @tagDescription@ can only appear once
        headerTemplate: "---\ntitle: @title@\nlayout: tagpage.html.ejs\n---\n<p><a href='./index.html'>Tag Index</a></p><p>Pages with tag @tagName@</p><p>@tagDescription@</p>",
        indexTemplate: "---\ntitle: Tags for AkashaCMS Example site\nlayout: tagpage.html.ejs\n---\n",
        pathIndexes: '/tags/'
    });

config.plugin("akashacms-affiliates")
    .amazonAffiliateCode(config, 'com', 'thereikipage')
    .noSkimlinksDomain(config, 'amazon.com')
    .noViglinksDomain(config, 'amazon.com');

config.plugin("akashacms-external-links")
    .setTargetBlank(config, true)
    .setShowFavicons(config, "before")
    .setShowIcon(config, "after")
    .setPreferNofollow(config, false)
    .addBlacklistEntry(config, 'google.com')
    .addBlacklistEntry(config, 'docs.google.com')
    .addBlacklistEntry(config, 'cnn.com')
    .addBlacklistEntry(config, 'bbc.co.uk')
    .addWhitelistEntry(config, '7gen.com')
    ;

config
    .addFooterJavaScript({ href: "/vendor/jquery/jquery.min.js" })
    .addFooterJavaScript({ href: "/vendor/popper.js/umd/popper.min.js" })
    .addFooterJavaScript({ href: "/vendor/bootstrap/js/bootstrap.min.js" })
    .addStylesheet({ href: "/vendor/bootstrap/css/bootstrap.min.css" })
    .addStylesheet({       href: "/style.css" });

config.setMahabhutaConfig({
    recognizeSelfClosing: true,
    recognizeCDATA: true,
    decodeEntities: true
});


const LoremIpsum = require("lorem-ipsum").LoremIpsum;

const lorem = new LoremIpsum({
    format: 'html',
    sentencesPerParagraph: {
      max: 8,
      min: 4
    },
    wordsPerSentence: {
      max: 16,
      min: 4
    }
});
  
class LoremIpsumElement extends mahabhuta.CustomElement {
    get elementName() { return "lorem-ipsum"; }
    async process($element, metadata, dirty) {
        const type = $element.attr('type');
        const count = $element.attr('count');

        if (typeof type === 'undefined' || !type) {
            throw new Error(`LoremIpsumElement no type supplied`);
        }
        if (typeof count === 'undefined' || !count) {
            throw new Error(`LoremIpsumElement no count supplied`);
        }

        let ret;
        if (type === 'words') {
            ret = lorem.generateWords(count);
        } else if (type === 'sentences') {
            ret = lorem.generateSentences(count);
        } else if (type === 'paragraphs') {
            ret = lorem.generateParagraphs(count);
        } else {
            throw new Error(`LoremIpsumElement unknown type ${type}`);
        }
        return ret;
    }
}

config.addMahabhuta(
    (() => {
        let ret = new mahabhuta.MahafuncArray("akashacms-perftest", {});
        ret.addMahafunc(new LoremIpsumElement());
        return ret;
    })());


config.prepare();

module.exports = config;
