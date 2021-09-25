// alex@prueba.com
const loginForm = document.querySelector('#loginForm')

loginForm.addEventListener('submit', login)

function login(e) {
  e.preventDefault()
  const password = e.target.password.value
  e.target.reset()

  const url = 'http://localhost:3000/server/capital/auth/login'
  const options = {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: {
      'Content-Type': 'application/json',
    },
  }

  fetch(url, options).then((resp) => {
    if (resp.status === 200) {
      // window.location.replace('http://localhost:3000/app/index.html')
      fetch('/server/capital/check')

      setTimeout(2000, window.location.replace(resp.url))
    }
  })
  // .then((resp) => window.location.replace(resp.url))
  // .catch((err) => console.log(err))
}
