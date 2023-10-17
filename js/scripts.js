const URL_API = 'https://jsonplaceholder.typicode.com';
const isAPI = false;
let loading = false;

const buscarUsuarios = async () => {
  let users = []

  if (isAPI) {
    users = await fetch(`${URL_API}/users`).then(response => response.json());
  } else {
    users = localStorage.getItem("usuarios") ? JSON.parse(localStorage.getItem("usuarios")) : [];
  }

  let html = "";

  if (users.length) {
    users.forEach(user => {
      html += `
        <div class="col-lg-6 col-xxl-4 mb-5">
          <div class="card bg-light border-0 h-100">
            <div class="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
              <div class="feature bg-primary bg-gradient text-white rounded-3 mb-4 mt-n4">
                <i class="bi bi-person"></i>
              </div>
              <h2 class="fs-4 fw-bold">
                ${user.name}
              </h2>
              <p class="mb-0">
                ${user.email}
              </p>
              <button class="btn btn-warning mt-3" onclick="editar(${user.id})">
                Editar
              </button>
              <button class="btn btn-danger mt-3" onclick="deletar(${user.id})">
                Deletar
              </button>
            </div>
          </div>
        </div>
      `
    });
  } else {
    html = `
        <div class="card bg-light border-0 h-100 mb-5">
          <div class="card-body text-center p-4 p-lg-5">
            <h2 class="fs-4 fw-bold">
              Nenhum usuário cadastrado
            </h2>
          </div>
        </div>
        <div class="mb-5"></div>
    `
  }

  const base = document.getElementById("usuarios");
  base.innerHTML = html;
}

const buscarUsuario = async (id) => {
  const nome = document.getElementById("nome");
  const email = document.getElementById("email");

  if (isAPI) {
    const user = await fetch(`${URL_API}/users/${id}`).then(response => response.json());

    nome.value = user.name;
    email.value = user.email;
  } else {
    const users = localStorage.getItem("usuarios") ? JSON.parse(localStorage.getItem("usuarios")) : [];
    const user = users.find(user => user.id == id);

    nome.value = user.name;
    email.value = user.email;
  }
}

window.onload = async function () {
  // Se base for diferente de null, quer dizer que o elemento existe na página
  // A página que possui esse elemento é a index.html

  const base = document.getElementById("usuarios");
  if (base) {
    await buscarUsuarios();
  }

  const btnForm = document.getElementById("btnForm");
  const id = new URLSearchParams(window.location.search).get("id");

  if (btnForm) {
    if (id) {
      await buscarUsuario(id);
      btnForm.innerHTML = `Atualizar`
    } else {
      btnForm.innerHTML = `Cadastrar`
    }
  }
};

function setLoading(loading = false) {
  const btnForm = document.getElementById("btnForm");

  if (loading) {
    btnForm.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `
  } else {
    const id = new URLSearchParams(window.location.search).get("id");
    btnForm.innerHTML = id ? `Atualizar` : `Cadastrar`
  }
}

async function enviar() {
  if (!loading) {
    setLoading(true);

    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const btnForm = document.getElementById("btnForm");

    btnForm.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `

    if (nome.value == "" || email.value == "") {
      alert("Preencha todos os campos!");
      setLoading();
    } else {

      if (isAPI) {
        const id = new URLSearchParams(window.location.search).get("id");
        const url = id ? `${URL_API}/users/${id}` : `${URL_API}/users`

        const body = {
          name: nome.value,
          email: email.value,
        };

        await fetch(url, {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(body),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        })
          .then(response => response.json())
          .then(data => {
            setLoading();

            if (confirm("Enviado com sucesso!")) {
              window.location.href = "index.html"
            }

          });
      } else {
        const id = new URLSearchParams(window.location.search).get("id");

        if (id) {
          const users = localStorage.getItem("usuarios") ? JSON.parse(localStorage.getItem("usuarios")) : [];
          const user = users.find(user => user.id == id);

          user.name = nome.value;
          user.email = email.value;

          localStorage.setItem("usuarios", JSON.stringify(users));
        } else {

          const users = localStorage.getItem("usuarios") ? JSON.parse(localStorage.getItem("usuarios")) : [];

          const body = {
            id: users.length + 1,
            name: nome.value,
            email: email.value,
          };

          users.push(body);

          localStorage.setItem("usuarios", JSON.stringify(users));
        }

        setTimeout(() => {
          setLoading();

          if (confirm("Enviado com sucesso!")) {
            window.location.href = "index.html"
          }

        }, 1000);
      }
    }
  }
}

function editar(userId) {
  window.location.href = `form.html?id=${userId}`;
}

async function deletar(userId) {
  if (confirm("Deseja realmente deletar esse usuário?")) {
    if (isAPI) {
      await fetch(`${URL_API}/users/${userId}`, {
        method: 'DELETE',
      })
        .then(() => {
          alert("Usuário deletado com sucesso!");
          window.location.reload();
        });
    } else {
      const users = localStorage.getItem("usuarios") ? JSON.parse(localStorage.getItem("usuarios")) : [];
      const newUsers = users.filter(user => user.id != userId);

      localStorage.setItem("usuarios", JSON.stringify(newUsers));

      alert("Usuário deletado com sucesso!");
      window.location.reload();
    }
  }
}