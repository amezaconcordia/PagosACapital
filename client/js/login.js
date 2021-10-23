// alex@prueba.com
const loginForm = document.querySelector('#loginForm')
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

function checkParams(urlParams) {
  if (!urlParams.get('IDRegistro')) {
    loginForm.style.display = 'none'
    alert('No hay un registro para poder realizar el pago.')
  }
}

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
      window.location.replace(
        `${resp.url}?IDRegistro=${urlParams.get('IDRegistro')}`
      )
    }
  })
  // .then((resp) => window.location.replace(resp.url))
  // .catch((err) => console.log(err))
}

checkParams(urlParams)

// Event listener
loginForm.addEventListener('submit', login)
