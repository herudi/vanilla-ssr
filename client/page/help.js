function help({ html, render }) {
  document.title = "welcome Help";
  render(() => html`
    <h1>Help</h1>
    <hr />
    <span>Example Help Page</span>
  `)
}

module.exports = help;