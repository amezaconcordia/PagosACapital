const tabla = document.querySelector('.detalle-facturas')

fetch('./facturas.json')
  .then((response) => response.json())
  .then((data) => {
    document.querySelector('.nombre-cliente').innerText = data[0].customer_name
    document.querySelector('.lote-cliente').innerText =
      data[0].zcrm_potential_name
  })
const divFacturas = document.querySelector('#facturas-container')
const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const submit = document.querySelector('#submit-pago')
let primerNoPagada = {}

// fetch('/server/pagos_capital/getInvoices')
function DatosTabla() {
  fetch('./facturas.json').then((resp) => {
    if (resp.status === 200) {
      resp.json().then((data) => {
        let facturas = new DocumentFragment()
        data.forEach((factura) => {
          // console.log(factura.invoice_id)
          if (!factura.reference_number.includes('GC')) {
            const divFactura = document.createElement('tr')
            tabla.appendChild(divFactura)
            //Fecha
            const spanFecha = document.createElement('td')
            spanFecha.textContent = factura.date
            divFactura.append(spanFecha)
            //Descripcion
            const spanDesc = document.createElement('td')
            spanDesc.textContent = factura.reference_number
            divFactura.classList.add('factura')
            divFactura.setAttribute('data-invoiceid', factura.invoice_id)
            divFactura.append(spanDesc)
            //Cantidad
            const spanPrecio = document.createElement('td')
            spanPrecio.textContent = formatPrice.format(factura.total)
            divFactura.append(spanPrecio)
            //Interes
            const spanInteres = document.createElement('td')
            spanInteres.textContent = factura.total
            spanInteres.textContent = formatPrice.format(factura.total)
            divFactura.append(spanInteres)
            //Capital
            const spanCapital = document.createElement('td')
            spanCapital.textContent = factura.total
            spanCapital.textContent = formatPrice.format(factura.total)
            divFactura.append(spanCapital)
            //Estado
            const spanEstado = document.createElement('td')
            const divEstatus = document.createElement('div')
            divEstatus.textContent = factura.status
            divFactura.append(spanEstado)
            if (factura.status == 'paid') {
              divEstatus.classList.add('paid')
            } else if (factura.status == 'partially_paid') {
              divEstatus.classList.add('partially-paid')
            } else if (factura.status == 'sent') {
              divEstatus.classList.add('sent')
            }
            spanEstado.append(divEstatus)
          }
          //Alertas
          // boton = document.querySelector('.boton');
          // boton.addEventListener('click', () => {
          //     currentAlert = document.getElementsByClassName('alert');
          //     if(factura.status == 'paid'){
          //         if(currentAlert.length == 0) {
          //             showAlert('success', 'Pago Realizado con Exito');
          //         } else {
          //         currentAlert[0].remove();
          //         }
          //     }
          //     if(factura.status == 'partially_paid'){
          //         if(currentAlert.length == 0) {
          //             showAlert('warning', 'Existen facturas parcialmente pagadas');
          //         } else {
          //         currentAlert[0].remove();
          //         }
          //     }
          //     if(currentAlert.length == 0) {
          //             showAlert('danger', 'Lo sentimos, no se pueden mostrar las facturas');
          //             } else {
          //             currentAlert[0].remove();
          //             }

          // });
        })

        primerNoPagada = data.find(
          (fact) =>
            fact.status == 'sent' && !fact.reference_number.includes('GC')
        )
        divFacturas.append(facturas)
      })
    }
  })
}
DatosTabla()

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

function closeAlert(e) {
  e.target.parentNode.classList.toggle('closed')
  setTimeout(function () {
    e.target.parentNode.remove()
  }, 650)
}

function showAlert(status, msg) {
  const alert = document.createElement('div')
  alert.style.display = 'block'
  alert.className = `alert ${status}`

  container = document.querySelector('body')
  message = document.createElement('div')
  message.className = 'message'
  message.innerText = msg
  alert.appendChild(message)
  close = document.createElement('span')
  close.className = 'alert-close'
  close.innerHTML = `&#10006;`
  close.addEventListener('click', closeAlert)
  alert.appendChild(close)
  container.appendChild(alert)

  setTimeout(function () {
    alert.classList.toggle('show')
  }, 100)
  setTimeout(function () {
    alert.style.transition = 'opacity 500ms'
  }, 800)
}
