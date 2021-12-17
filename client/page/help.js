function help({ html, render, seo }) {
  seo.title = "welcome Help";
  render(() => html`
    <h1>Help</h1>
    <hr />
    <span>Example Help Page</span>
  `)
}

module.exports = help;