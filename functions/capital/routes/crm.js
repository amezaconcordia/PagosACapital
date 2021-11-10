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

// Actualizar Monto con Interes
router.put('/updateMontoItem/:item_id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  const { monto } = req.body

  //Config Axios
  const item_id = req.params.item_id

  const data = {
    data: [
      {
        id: item_id,
        Precio_con_Interes: monto.toFixed(2),
      },
    ],
  }

  const config = {
    method: 'put',
    url: `https://www.zohoapis.com/crm/v2/products/${item_id}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    data: JSON.stringify(data),
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data)
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
    console.log(resp.data)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})


router.get('/eliminarFacturas2/:id/:position', async (req, res) => {
  try {

    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/functions/eliminarFacturasCount/actions/execute?auth_type=apikey&zapikey=${process.env.CRM_API}`,
      params: {
        id: req.params.id,
        position: req.params.position,
      },
    }

    const resp = await axios(config)
    console.log(resp.data)
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
        factura_Inicial: req.query.factura_Inicial,
        factura_Final: req.query.factura_Final,
        Pago_capital: req.query.Pago_capital,
      },
    }

    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// CRM creacion masiva de facturas
router.get('/creacionMasiva', async (req, res) => {
  console.log(req.query)
  try {
    const config = {
      method: 'get',
      url: `https://www.zohoapis.com/crm/v2/functions/creacionfacturascapital/actions/execute?auth_type=apikey&zapikey=${process.env.CRM_API}`,
      params: {
        IDOportunidad: req.query.IDOportunidad,
        IDClienteBooks: req.query.IDClienteBooks,
        IDProductoBooks: req.query.IDProductoBooks,
        IDPresupuesto: req.query.IDPresupuesto,
        Position: parseInt(req.query.position),
      },
    }
    const resp = await axios(config)
    console.log(resp)
    res.send('Las facturas fueron creadas')
  } catch (error) {
    res.status(500).send(error)
  }

  // try {
  //   const config = {
  //     method: 'get',
  //     url: `https://www.zohoapis.com/crm/v2/functions/creacionfacturascapital/actions/execute?auth_type=apikey&zapikey=${process.env.CRM_API}`,
  //     params: {
  //       IDOportunidad: req.query.IDOportunidad,
  //       IDClienteBooks: req.query.IDClienteBooks,
  //       IDProductoBooks: req.query.IDProductoBooks,
  //       IDPresupuesto: req.query.IDPresupuesto,
  //       size: req.query.size,
  //     },
  //   }

  //   const resp = await axios(config)
  //   res.send(resp.data)
  // } catch (error) {
  //   console.log(error)
  // }
})

module.exports = router
