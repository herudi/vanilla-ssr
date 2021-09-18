async function contact({ html, api }) {
  document.title = "welcome contact";
  const users = await api("/contact");
  return html`
    <h1>Contacts</h1>
    <hr />
    <div class="row">
      ${users.map(user => html`
          <div class="col-md-3" style="padding: 10px;">
            <div class="card" style="width: 100%;">
              <img src="https://wolftracker9eee.blob.core.windows.net/wolfpictures-mock/${user.picture}" class="card-img-top"
                alt="dummy">
              <div class="card-body">
                <h5 class="card-title">
                ${user.username}
                </h5>
                <p class="card-text">Phone : ${user.phone_number}
                </p>
                <a href="/${user.username}" class="btn btn-primary" van-link>Information User</a>
              </div>
            </div>
          </div>
        `  
      ).join("")}
    </div>
  `
}

module.exports = contact;