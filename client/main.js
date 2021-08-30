const divFacturas = document.querySelector('#facturas-container')
const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const submit = document.querySelector('#submit-pago')
let primerNoPagada = {}

// fetch('/server/pagos_capital/getInvoices')
fetch('./facturas.json').then((resp) => {
  if (resp.status === 200) {
    resp.json().then((data) => {
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
        (fact) => fact.status == 'sent' && !fact.reference_number.includes('GC')
      )
      divFacturas.append(facturas)
    })
  }
})

submit.addEventListener('click', (e) => {
  e.preventDefault()
  console.log(JSON.stringify(crearFactura()))
  alert(JSON.stringify(crearFactura()))
})

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
        item_id: 123123124,
        description: desc,
        quantity: 1,
      },
    ],
    custom_fields: [
      {
        label: 'TipoProducto',
        value: 'Casa',
      },
      {
        label: 'Capital',
        value: montoFactura,
      },
      {
        label: 'Interes',
        value: 0,
      },
    ],
  }
}

// const pruebaResp = () => {
//   const email = 'alejandro@villaprueba.com'
//   fetch(`/server/capital/books/getIdContacto/${email}`)
//     .then((resp) => resp.json())
//     .then((data) => {
//       document.querySelector('body').append(data)
//     })
// }
