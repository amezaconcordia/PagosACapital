import * as util from './util.js'

// Variable declarations
const tabla = document.querySelector('.detalle-facturas')
// document.querySelector('.nombre-cliente').innerText = data[0].customer_name
// document.querySelector('.lote-cliente').innerText = data[0].zcrm_potential_name
let pagadoCapital = 0
const divFacturas = document.querySelector('#facturas-container')
const formatPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})
const submit = document.querySelector('#submit-pago')
let primerNoPagada,
  customer_name,
  item_name,
  item_id,
  idsInvoices,
  consecutivo,
  plazo

// Function declarations
const DatosTabla = async () => {
  const data = await getData()
  // let [customer_name, item_name] = data'
  customer_name = data[0]
  item_name = data[1]
  item_id = data[2]
  document.querySelector('.nombre-cliente').innerText = customer_name
  document.querySelector('.lote-cliente').innerText = item_name
  // customer_name = 'ALEJANDRO MEZA ZAMORA'
  // item_name = 'VILLA PRUEBA M2-L2'
  fetch(`/server/capital/books/getInvoices/${customer_name}&${item_name}`).then(
    (resp) => {
      if (resp.status === 200) {
        resp.json().then((data) => {
          let facturas = new DocumentFragment()
          data.forEach((factura) => {
            // console.log(factura.invoice_id)
            if (!factura.reference_number.includes('GC')) {
              const capital = factura.custom_fields.find(
                (cf) => cf.label === 'Capital'
              )
              const interes = factura.custom_fields.find(
                (cf) => cf.label === 'Interes'
              )
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
              spanInteres.textContent = formatPrice.format(
                parseFloat(interes.value)
              )
              divFactura.append(spanInteres)
              //Capital
              const spanCapital = document.createElement('td')
              spanCapital.textContent = factura.total
              spanCapital.textContent = formatPrice.format(
                parseFloat(capital.value)
              )
              divFactura.append(spanCapital)
              //Estado
              const spanEstado = document.createElement('td')
              const divEstatus = document.createElement('div')
              divEstatus.textContent = factura.status
              divFactura.append(spanEstado)
              if (factura.status == 'paid') {
                // Saber cuanto tiene pagado a Capital
                pagadoCapital = pagadoCapital + capital.value
                divEstatus.classList.add('paid')
              } else if (factura.status == 'partially_paid') {
                // Calcular cuando pago parcial tiene y sumarlo
                // P E N D I E N T E
                divEstatus.classList.add('partially-paid')
              } else if (factura.status == 'sent') {
                divEstatus.classList.add('sent')
              }
              spanEstado.append(divEstatus)
            }
          })

          // Obtener primer no pagada
          primerNoPagada = data.find(
            (fact) =>
              fact.status == 'sent' && !fact.reference_number.includes('GC')
          )

          // Get Consecutivo actual
          consecutivo = parseInt(primerNoPagada.reference_number.split(' ')[0])
          console.log('Consecutivo: ', consecutivo)

          // Get plazo
          plazo = parseInt(primerNoPagada.reference_number.split(' ')[2])
          console.log('Plazo: ', plazo)

          // Obtener facturas para eliminar
          /*
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
              return factura.invoice_id
            })
          console.log(idsInvoices)
          */
          console.log('Pagado a capital', pagadoCapital)
          // Agregar facturas a html
          divFacturas.append(facturas)
          $('.loader-wrapper').fadeOut('slow')
        })
      }
    }
  )
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

const getData = async () => {
  const resps = await getInfoFromBooks()
  let customer_name = resps[0].contact.contact_name
  let item_name = resps[1].name
  let item_id = resps[1].item_id
  return [customer_name, item_name, item_id]
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
      {
        label: 'Pago a Capital',
        value: true,
      },
      {
        label: 'Capital',
        value: document.querySelector('#pago').value,
      },
      {
        label: 'Interes',
        value: 0,
      },
    ],
  }
}

const creatorRecord = async (record_id) => {
  // console.log(primerNoPagada)
  const creator_resp = await fetch(
    `/server/capital/creator/searchRecord/${record_id}`
  )
  const creator_record = creator_resp.json()
  return await creator_record
}

const getDatosCreator = async () => {
  const record = await creatorRecord(38)
  // console.log(await record)
  let amortizacion = JSON.parse(`[${record.JSON_Amortizacion}]`)
  console.log(amortizacion)
  console.log('Consecutivo actual', consecutivo)
  let pagoActual = amortizacion.find((f) => f.Consecutivo == consecutivo)
  return {
    saldoInicial: pagoActual.SaldoInicial,
    id: record.ID,
  }
}

// script
DatosTabla()

// Event listeners
/*
submit.addEventListener('click', async (e) => {
  e.preventDefault()
  const montoCapital = parseFloat(document.querySelector('#pago').value)
  console.log('Monto Capital: ', montoCapital)
  // Actualizar reporte
  try {
    const datos = await getDatosCreator()
    console.log(datos)
    let nuevoSaldoInicial = datos.saldoInicial - montoCapital
    console.log('nuevo saldo inicial', nuevoSaldoInicial)
    const updateRegistro = fetch(
      `/server/capital/crm/calcularAmortizacion?IDPresupuesto=${datos.id}&Monto_Inicial=${nuevoSaldoInicial}&Fecha_Inicial=2020-07-09&factura_Inicial=${consecutivo}&factura_Final=${plazo}`
    )
    const updateResp = (await updateRegistro).json()
    console.log(await updateResp)
  } catch (error) {
    util.showAlert('danger', JSON.stringify(error))
  }
})
*/
submit.addEventListener('click', async (e) => {
  e.preventDefault()
  const montoCapital = parseFloat(document.querySelector('#pago').value)
  console.log('Monto Capital: ', montoCapital)
  // Actualizar reporte
  try {
    const datos = await getDatosCreator()
    console.log(datos)
    let nuevoSaldoInicial = datos.saldoInicial - montoCapital
    console.log('nuevo saldo inicial', nuevoSaldoInicial)
    const updateRegistro = fetch(
      `/server/capital/crm/calcularAmortizacion?IDPresupuesto=${datos.id}&Monto_Inicial=${nuevoSaldoInicial}&Fecha_Inicial=2020-07-09&factura_Inicial=${consecutivo}&factura_Final=${plazo}`
    )
    const updateResp = (await updateRegistro).json()
    console.log(await updateResp)
    util.showAlert('success', JSON.stringify(await updateResp))
  } catch (error) {
    util.showAlert('danger', JSON.stringify(await error))
    console.log(error)
  }

  // console.log(JSON.stringify(crearFactura()))
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
        let masFacturas = true
        resp.json().then((data) => {
          // Factura creada, poner factura en estado enviado
          const invoice_id = data.invoice.invoice_id
          fetch(`/server/capital/books/sendInvoice/${invoice_id}`)
            .then((resp) => resp.json())
            .then((data) => {
              console.log('creo factura...')
              util.showAlert('success', JSON.stringify(data.message))
            })
            .catch((error) => util.showAlert('danger', JSON.stringify(error)))
        })
        /*
          .then((resp) => {
            // Eliminar facturas
            fetch(
              `/server/capital/crm/eliminarFacturas?customer_name=${customer_name}&item_name=${item_name}&masFacturas=${masFacturas}`
            )
              .then((resp) => resp.json())
              .then((data) => {
                util.showAlert('success', JSON.stringify(data.details.output))
              })
              .catch((error) => util.showAlert('danger', error))
          })
          */
      }
    })
    .catch((error) => util.showAlert('danger', JSON.stringify(error)))
})
