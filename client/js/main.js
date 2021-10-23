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
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const submit = document.querySelector('#submit-pago')
let primerNoPagada,
  record,
  customer_name,
  item_name,
  item_id,
  id_Creator,
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
              // Consecutivo de Factura
              let consecutivoFactura = parseInt(
                factura.reference_number.split(' ')[0]
              )
              divFactura.setAttribute('data-consecutivo', consecutivoFactura)
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

          console.log('Pagado a capital', pagadoCapital)
          // Agregar facturas a html
          divFacturas.append(facturas)
          $('.loader-wrapper').fadeOut('slow')
        })
      }
    }
  )
}

const getCreatorRecord = async (id) => {
  const creator_resp = await fetch(`/server/capital/creator/getRecord/${id}`)
  const creator_record = creator_resp.json()
  return await creator_record
}

const crearNuebaTabla = (json_amortizacion) => {
  console.log('Creando nueva tabla')
  const rows = Array.from(tabla.getElementsByTagName('tr'))
  // console.log(rows)
  const filterFact = rows.filter((row) => row.cells[5].textContent == 'sent')
  // console.log(filterFact)
  filterFact.forEach((row) => {
    let cells = row.cells
    // console.log(cells)
    const consecutivo = row.dataset.consecutivo
    const factura = json_amortizacion.find((e) => e.Consecutivo == consecutivo)
    // Actualizar Mensualidad
    cells[2].textContent = formatPrice.format(factura.Mensualidad)
    // Actualizar Interes
    cells[3].textContent = formatPrice.format(factura.Interes)
    // Actualizar Capital
    cells[4].textContent = formatPrice.format(factura.Capital)
  })
  // console.log(json_amortizacion)
}

// ###Not used
const getInfoFromBooks = async () => {
  const idContacto = record.IDContactoBooks
  const idItem = record.IDProductoBooks
  const responses = await Promise.all([
    fetch(`/server/capital/books/getContacto/${idContacto}`),
    fetch(`/server/capital/books/getItemById/${idItem}`),
  ])

  const dataPromises = responses.map((result) => result.json())

  return await Promise.all(dataPromises)
}

const getData = async () => {
  // const resps = await getInfoFromBooks()
  // let customer_name = resps[0].contact.contact_name
  // let item_name = resps[1].name
  // let item_id = resps[1].item_id
  let customer_name = record.NombreContacto
  let item_name = record.Producto
  let item_id = record.IDProductoBooks
  return [customer_name, item_name, item_id]
}

const crearFactura = () => {
  const montoFactura = document.querySelector('#pago').value
  console.log('primerNOpagada', primerNoPagada)
  const refSplit = primerNoPagada.reference_number.split(' ')
  const desc = `Pago a Capital de Consecutivo ${refSplit[0]} de ${refSplit[4]} ${refSplit[5]} ${refSplit[6]}`

  return {
    customer_id: primerNoPagada.customer_id,
    zcrm_potential_id: primerNoPagada.zcrm_potential_id,
    date: primerNoPagada.date,
    reference_number: `Capital ${refSplit[0]} de ${refSplit[4]} ${refSplit[5]} ${refSplit[6]}`,
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

const getDatosCreator = async () => {
  let amortizacion = JSON.parse(`[${record.JSON_Amortizacion}]`)
  console.log(amortizacion)
  console.log('Consecutivo actual', consecutivo)
  let pagoActual = amortizacion.find((f) => f.Consecutivo == consecutivo)
  id_Creator = record.ID
  return {
    saldoInicial: pagoActual.SaldoInicial,
    id: record.ID,
  }
}

// @ Operacion Actualizar Reporte Creator
const actualizarReporte = async () => {
  const montoCapital = parseFloat(document.querySelector('#pago').value)
  console.log('Monto Capital: ', montoCapital)
  // Actualizar reporte
  try {
    const datos = await getDatosCreator()
    console.log(datos)
    let nuevoSaldoInicial = datos.saldoInicial - montoCapital
    console.log('nuevo saldo inicial', nuevoSaldoInicial)
    const updateRegistro = fetch(
      `/server/capital/crm/calcularAmortizacion?IDPresupuesto=${datos.id}&Monto_Inicial=${nuevoSaldoInicial}&factura_Inicial=${consecutivo}&factura_Final=${plazo}&Pago_capital=${montoCapital}`
    )
    return await (await updateRegistro).json()
  } catch (error) {
    return error
  }
}

// @ Operacion Crear Factura Books
const crearFacturaBooks = async () => {
  {
    try {
      const invoice = fetch('/server/capital/books/createInvoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(crearFactura()),
      })

      return await (await invoice).json()
    } catch (error) {
      return error
    }
  }
}

// @ Operacion Enviar Factura
const enviarFactura = async (invoice_id) => {
  try {
    const enviar = fetch(`/server/capital/books/sendInvoice/${invoice_id}`)
    return await (await enviar).json()
  } catch (error) {
    return error
  }
}

// @ Operacion Eliminar Facturas
const eliminarFacturas = async () => {
  try {
    const eliminar = fetch(
      `/server/capital/crm/eliminarFacturas?customer_name=${customer_name}&item_name=${item_name}&masFacturas=true`
    )
    return await (await eliminar).json()
  } catch (error) {
    return error
  }
}

// @ Operacion Creacion Facturas
const creacionInvoices = async (
  oportunidad,
  cliente,
  producto,
  presupuesto,
  size
) => {
  try {
    /* 
        IDOportunidad: req.query.IDOportunidad,
        IDClienteBooks: req.query.IDClienteBooks,
        IDProductoBooks: req.query.IDProductoBooks,
        IDPresupuesto: req.query.IDPresupuesto,
        size: req.query.size,
    */
    const creacion = fetch(
      `/server/capital/crm/creacionMasiva?IDOportunidad=${oportunidad}&IDClienteBooks=${cliente}&IDProductoBooks=${producto}&IDPresupuesto=${presupuesto}&size=${size}`
    )
    return await (await creacion).json()
  } catch (error) {
    return error
  }
}

// Actualizar monto con interes
const actualizarMontoInteres = async (montoNuevo) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    monto: montoNuevo,
  })

  const requestOptions = {
    method: 'PUT',
    headers: myHeaders,
    body: raw,
  }
  try {
    const responses = await Promise.all([
      fetch(`/server/capital/books/updateMontoItem/${item_id}`, requestOptions),
      fetch(
        `/server/capital/crm/updateMontoItem/2234337000028805061`,
        requestOptions
      ),
    ])
    const dataPromises = responses.map((result) => result.json())
    const promisesResp = Promise.all(dataPromises)
    return promisesResp
  } catch (error) {
    console.log(error)
  }
}

// Get params
const IDRegistro = urlParams.get('IDRegistro')
// script
if (IDRegistro) {
  const fetchRecord = await getCreatorRecord(IDRegistro)
  record = fetchRecord.data

  DatosTabla()
} else {
  util.showAlert('warning', 'No se puede realizar un pago sin registro')
}

// Event listeners

submit.addEventListener('click', async (e) => {
  e.preventDefault()

  try {
    // Actualizar reporte
    const actualizar = await actualizarReporte()
    console.log(actualizar)
    let resp = JSON.parse(actualizar.details.output)
    console.log(resp)
    util.showAlert('success', JSON.stringify(resp.data.message))

    if (resp.code == 0) {
      console.log('Actualizo el registro')
      crearNuebaTabla(resp.data.JSON_Amortizacion)
      const montoNuevo = resp.data.NewMonto
      console.log('monto nuevo', montoNuevo)
      let size = resp.data.sizemap

      // Actualizar monto con Interes
      const updateMontos = await actualizarMontoInteres(montoNuevo)
      console.log(updateMontos)

      // Crear factura
      const invoiceResp = await crearFacturaBooks()
      const invoice_id = invoiceResp.invoice.invoice_id
      util.showAlert('success', JSON.stringify(invoiceResp.message))

      // Enviar factura
      const enviar = await enviarFactura(invoice_id)
      console.log(enviar)
      util.showAlert('success', JSON.stringify(enviar.message))

      // Eliminar facturas
      const eliminar = await eliminarFacturas()
      console.log(eliminar)
      util.showAlert('success', JSON.stringify(eliminar.details.output))

      // Creacion Masiva
      const creacionMasiva = await creacionInvoices(
        record.IDOportunidad,
        record.IDContactoBooks,
        item_id,
        id_Creator,
        size
      )
      console.log(creacionMasiva)
      util.showAlert('success', JSON.stringify(creacionMasiva))
    }
  } catch (error) {
    console.log(error)
    util.showAlert('danger', JSON.stringify(error))
  }
})
