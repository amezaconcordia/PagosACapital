// alex@prueba.com
const loginForm = document.querySelector('#loginForm')

loginForm.addEventListener('submit', login)

function login(e) {
  e.preventDefault()
  const password = e.target.password.value
  const sector = e.target.sector.value
  e.target.reset()

  const url = '/server/capital/login'
  const options = {
    method: 'POST',
    body: JSON.stringify({ sector, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  }

  fetch(url, options).then((resp) => {
    if (resp.status === 200) {
      window.location.replace(resp.url)
    }
  })
  // .then((resp) => window.location.replace(resp.url))
  // .catch((err) => console.log(err))
}
