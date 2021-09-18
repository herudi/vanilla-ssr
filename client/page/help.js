function help({ html }) {
  document.title = "welcome Help";
  return html`
    <h1>Help</h1>
    <hr />
    <span>Example Help Page</span>
  `
}

module.exports = help;