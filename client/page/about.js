function about({ html }) {
  document.title = "welcome About";
  return html`
    <h1>About</h1>
    <hr />
    <span>Example About Page</span>
  `
}

module.exports = about;