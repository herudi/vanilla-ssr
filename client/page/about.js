function about({ html, render, seo }) {
  seo.title = "welcome About";
  render(() => html`
    <h1>About</h1>
    <hr />
    <span>Example About Page</span>
  `)
}

module.exports = about;