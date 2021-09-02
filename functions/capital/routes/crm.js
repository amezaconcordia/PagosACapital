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

// custom function - testApi
router.get('/eliminarFacturas', async (req, res) => {
  const config = {
    method: 'get',
    url: `https://www.zohoapis.com/crm/v2/functions/testapi/actions/execute?auth_type=apikey&zapikey=1003.6c8cc5ee83800cb0356fcde1276dd5f4.feebc46f71c98145097630dca0fa0b05`,
    params: {
      customer_name: req.query.customer_name,
      item_name: req.query.item_name,
      masFacturas: true,
    },
  }
  console.log(config)
  try {
    const resp = await axios(config)
    res.send(resp.data)
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
