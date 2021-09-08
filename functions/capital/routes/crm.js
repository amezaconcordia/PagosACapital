const express = require('express')
const axios = require('axios')
const catalystToken = require('../catalysToken')
let router = express.Router()

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// obtener Producto CRM
router.get('/getProducto/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  // Config para axios
  const idProducto = req.params.id
  const config = {
    method: 'get',
    url: `https://www.zohoapis.com/crm/v2/Products/${idProducto}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data.data[0])
    // console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// obtener Contacto (por ID)
router.get('/getContacto/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  // Config para axios
  const idContacto = req.params.id
  const config = {
    method: 'get',
    url: `https://www.zohoapis.com/crm/v2/Contacts/${idContacto}`,
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

// CRM custom function - testApi
router.get('/eliminarFacturas', async (req, res) => {
  try {
    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/functions/testapi/actions/execute?auth_type=apikey&zapikey=${process.env.CRM_API}`,
      params: {
        customer_name: req.query.customer_name,
        item_name: req.query.item_name,
        masFacturas: true,
      },
    }

    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// CRM custom function - CalcularCapital
router.get('/calcularAmortizacion', async (req, res) => {
  try {
    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/functions/calcularcapital/actions/execute?auth_type=apikey&zapikey=${process.env.CRM_API}`,
      params: {
        IDPresupuesto: req.query.IDPresupuesto,
        Monto_Inicial: req.query.Monto_Inicial,
        Fecha_Inicial: req.query.Fecha_Inicial,
        factura_Inicial: req.query.factura_Inicial,
        factura_Final: req.query.factura_Final,
      },
    }

    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
