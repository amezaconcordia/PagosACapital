const divFacturas = document.querySelector('#facturas-container')
const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const submit = document.querySelector('#submit-pago')
let primerNoPagada = {}
let customer_name, item_name, item_id, idsInvoices

const getData = async () => {
  const resps = await getInfoFromBooks()
  customer_name = resps[0].contact.contact_name
  item_name = resps[1].name
  item_id = resps[1].item_id
  return [customer_name, item_name]
}

const crearFactura = () => {
  const montoFactura = document.querySelector('#pago').value
  console.log('primerNOpagada', primerNoPagada)
  const refSplit = primerNoPagada.reference_number.split(' ')
  const desc = `Pago por Concepto de Mensualidad ${refSplit[0]} de ${refSplit[2]} de ${refSplit[4]} ${refSplit[5]} ${refSplit[6]}`

  return {
    customer_id: primerNoPagada.customer_id,
    zcrm_potential_id: primerNoPagada.zcrm_potential_id,
    date: primerNoPagada.date,
    reference_number: primerNoPagada.reference_number,
    line_items: [
      {
        rate: montoFactura,
        item_id: item_id,
        description: desc,
        quantity: 1,
      },
    ],
    custom_fields: [
      {
        label: 'TipoProducto',
        value: 'Casa',
      },
    ],
  }
}

const pruebaResp = () => {
  // const idContacto = '888587000033680404'
  // fetch(`/server/capital/books/getContacto/${idContacto}`)
  //   .then((resp) => resp.json())
  //   .then((data) => {
  //     console.log(data)
  //   })
  getData().then((resp) => {
    let [nombre, prod] = resp
    console.log(`nombre: ${nombre} item: ${prod}`)
    console.log(item_id)
  })
}

const getInfoFromBooks = async () => {
  const idContacto = '888587000033680404'
  const idItem = '888587000011266039'
  const responses = await Promise.all([
    fetch(`/server/capital/books/getContacto/${idContacto}`),
    fetch(`/server/capital/books/getItemById/${idItem}`),
  ])

  const dataPromises = responses.map((result) => result.json())

  return await Promise.all(dataPromises)
}

const getInvoices = () => {
  getData().then((resp) => {
    let [customer_name, item_name] = resp

    fetch(
      `/server/capital/books/getInvoices/${customer_name}&${item_name}`
    ).then((resp) => {
      if (resp.status === 200) {
        resp.json().then((data) => {
          console.log(data.length)
          idsInvoices = data
            .filter((factura) => {
              if (
                !factura.reference_number.includes('GC') ||
                !factura.reference_number.includes('GCC')
              ) {
                if (factura.status == 'sent') {
                  return factura
                } else if (factura.status == 'overdue') {
                  if (factura.balance == factura.total) {
                    return factura
                  }
                }
              }
            })
            .map((factura) => {
              return [factura.invoice_id, factura.reference_number]
            })
          console.log(idsInvoices)
          let facturas = new DocumentFragment()
          data.forEach((factura) => {
            // console.log(factura.invoice_id)
            if (!factura.reference_number.includes('GC')) {
              const divFactura = document.createElement('DIV')
              divFactura.textContent = factura.reference_number
              divFactura.classList.add('factura')
              divFactura.setAttribute('data-invoiceid', factura.invoice_id)
              if (factura.status == 'paid') {
                divFactura.classList.add('paid')
              } else if (factura.status == 'partially_paid') {
                divFactura.classList.add('partially-paid')
              }
              const spanPrecio = document.createElement('span')
              spanPrecio.textContent = formatPrice.format(factura.total)
              spanPrecio.classList.add('invoice-price')
              divFactura.append(spanPrecio)
              facturas.append(divFactura)
            }
          })

          primerNoPagada = data.find(
            (fact) =>
              fact.status == 'sent' && !fact.reference_number.includes('GC')
          )
          divFacturas.append(facturas)
        })
      }
    })
  })
}

getInvoices()

// fetch('./facturas.json').then((resp) => {
//   if (resp.status === 200) {
//     resp.json().then((data) => {
//       let facturas = new DocumentFragment()
//       data.forEach((factura) => {
//         // console.log(factura.invoice_id)
//         if (!factura.reference_number.includes('GC')) {
//           const divFactura = document.createElement('DIV')
//           divFactura.textContent = factura.reference_number
//           divFactura.classList.add('factura')
//           divFactura.setAttribute('data-invoiceid', factura.invoice_id)
//           if (factura.status == 'paid') {
//             divFactura.classList.add('paid')
//           } else if (factura.status == 'partially_paid') {
//             divFactura.classList.add('partially-paid')
//           }
//           const spanPrecio = document.createElement('span')
//           spanPrecio.textContent = formatPrice.format(factura.total)
//           spanPrecio.classList.add('invoice-price')
//           divFactura.append(spanPrecio)
//           facturas.append(divFactura)
//         }
//       })

//       primerNoPagada = data.find(
//         (fact) => fact.status == 'sent' && !fact.reference_number.includes('GC')
//       )
//       divFacturas.append(facturas)
//     })
//   }
// })

submit.addEventListener('click', (e) => {
  e.preventDefault()
  console.log(JSON.stringify(crearFactura()))
  fetch('/server/capital/books/createInvoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(crearFactura()),
  })
    .then((resp) => {
      if (resp.status === 200) {
        resp.json().then((data) => {
          // Factura creada, poner factura en estado enviado
          const invoice_id = data.invoice.invoice_id
          fetch(`/server/capital/books/sendInvoice/${invoice_id}`)
            .then((resp) => resp.json())
            .then((data) => alert(JSON.stringify(data)))
            .catch((error) => console.log(error))
        })
      }
    })
    .catch((error) => console.log(error))
})
