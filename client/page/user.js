async function user({ html, params, api, initServerData, render, seo }) {
  const user = initServerData ? initServerData : (await api("/contact/" + params.username));
  if (!user.username) return render(() => html`<h1>PAGE NOT FOUND</h1>`);
  seo.title = user.username;
  render(() => html`
    <div class="card">
      <div class="card-header">
        ${user.username}
      </div>
      <div class="card-body">
        <img width="200" src="https://wolftracker9eee.blob.core.windows.net/wolfpictures-mock/${user.picture}" alt="dummy">
        <br />
        <br />
        <br />
        <h5 class="card-title">${user.phone_number}</h5>
        <p class="card-text">
          <div>Name : ${user.first_name} ${user.last_name}</div>
          <div>Email : ${user.email}</div>
          <div>Gender : ${user.gender}</div>
          <div>Address : ${user.location.street}, ${user.location.city}, ${user.location.state}</div>
        </p>
        <a href="/" class="btn btn-primary" u-link>Go Contact</a>
      </div>
    </div>
  `)
}

module.exports = user;