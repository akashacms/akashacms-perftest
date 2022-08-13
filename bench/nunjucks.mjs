
import nunjucks from 'nunjucks';
let people = ['geddy', 'neil', 'alex'];

const template = nunjucks.compile('Hello {{ username }}');
console.log(template);

console.log(nunjucks.renderString('{{ people | join(", ") }}', { people: people }));

console.log(nunjucks.renderString(`
    <ul id="products">
    {% for person in people %}
        <li>{{ person }}</li>
    {% endfor %}
    </ul>
    `, { people: people }));

