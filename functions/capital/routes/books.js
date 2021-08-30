const express = require('express')
const axios = require('axios')
const catalystToken = require('../catalysToken')
// const fetch = require('node-fetch')
let router = express.Router()

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// Obtener contacto de books utilizando correo de contacto en crm
router.get('/getIdProducto/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/items?zcrm_product_id=${req.params.id}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data.items[0].item_id)
    // console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Obtener id contacto con correo
router.get('/getIdContacto/:email', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/contacts?email=${req.params.email}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data.contacts[0].contact_id)
    // console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Obtener factura por ID
router.get('/getInvoiceById/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/invoices/${req.params.id}?organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data)
    // console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Obtener facturas
router.get('/getInvoices/:customer_name&:item_name', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/invoices?customer_name=${req.params.customer_name}&item_name=${req.params.item_name}&page=1&sort_column=created_time&sort_order=A&organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const respInvoices = await axios(config)
    if (respInvoices.data.page_context.has_more_page == true) {
      console.log('Consiguiendo mas facturas...')
      let config2 = {
        method: 'get',
        url: `https://books.zoho.com/api/v3/invoices?customer_name=${req.params.customer_name}&item_name=${req.params.item_name}&page=2&sort_column=created_time&sort_order=A&organization_id=${process.env.ORGANIZATION_BOOKS}`,
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        },
      }
      const resp2 = await axios(config2)
      const allInvoices = [
        ...respInvoices.data.invoices,
        ...resp2.data.invoices,
      ]
      console.log('size', allInvoices.length)
      res.send(allInvoices)
    } else {
      res.send(respInvoices.data.invoices)
    }
  } catch (error) {
    console.log(error)
  }
})

// Crear invoice -- Pendiente cambiar a POST !!!
router.get('/createInvoice', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  //Config Axios
  const invoice = {
    customer_id: '888587000033680404',
    custom_fields: [{ label: 'TipoProducto', value: 'Casa' }],
    line_items: [
      {
        rate: 3000,
        description: 'pago a capital',
        quantity: 1,
        item_id: '888587000011266039',
      },
    ],
    date: '2021-08-26',
    due_date: '2021-08-31',
    reference_number: '5 de 240 VILLA PRUEBA M2-L2',
    zcrm_potential_id: '2234337000105397015',
  }

  const config = {
    method: 'post',
    url: `https://books.zoho.com/api/v3/invoices?organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    data: invoice,
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Enviar Factura
router.get('/sendInvoice/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  //Config Axios
  const invoiceId = req.params.id

  const config = {
    method: 'post',
    url: `https://books.zoho.com/api/v3/invoices/${invoiceId}/status/sent?organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Obtener un producto por ID
router.get('/getItemById/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  //Config Axios
  const idProductoBooks = req.params.id

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/items/${idProductoBooks}?organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data.item)
  } catch (error) {
    console.log(error)
  }
})

// Obtener ID de producto utilizando el ID de producto en CRM
router.get('/getIdItem/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  //Config Axios
  const idProductoBooks = req.params.id

  const config = {
    method: 'get',
    url: `https://books.zoho.com/api/v3/items?zcrm_product_id=${idProductoBooks}&organization_id=${process.env.ORGANIZATION_BOOKS}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data.items[0].item_id)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
