async function contact({ 
  html, 
  api, 
  initServerData, 
  render, 
  useValue, 
  seo,
  toAction
}) {
  seo.title = "welcome contact";
  const dataUser = useValue([]);
  const searchUser = useValue();
  const searchText = useValue("");
  dataUser.value = initServerData ? initServerData : (await api("/contact"));
  const onSearch = (e) => {
    e.preventDefault();
    const text = e.target.value;
    searchText.value = text;
    if (!text) {
      searchUser.value = undefined;
    } else {
      searchUser.value = dataUser.value.filter(el => el.username.startsWith(text));
    }
  }
  render(() => html`
    <h1>Contacts</h1>
    <hr />
    <input oninput="${toAction(onSearch)}" value="${searchText.value}" placeholder="Search by username"/>
    <div class="row">
      ${(searchUser.value || dataUser.value).map(user => html`
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
                <a href="/${user.username}" class="btn btn-primary" u-link>Information User</a>
              </div>
            </div>
          </div>
        `  
      ).join("")}
    </div>
  `)
}

module.exports = contact;