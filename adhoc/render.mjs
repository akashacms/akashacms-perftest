
import { bench, run } from "mitata";

// import * as ejs from 'ejs';

let people = ['geddy', 'neil', 'alex'];

bench('literal', () => { return `${people.join(', ')}`; });

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
try {
    await run();
} catch (err) { console.error(err); }
