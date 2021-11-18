const express = require('express')
const axios = require('axios')
const catalystToken = require('../catalysToken')
let router = express.Router()

router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// Obtener 1 registro de reporte Presupuesto
router.get('/getRecord/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  // Config para axios
  const idRegistro = req.params.id
  const config = {
    method: 'get',
    url: `https://creator.zoho.com/api/v2/sistemas134/cotizadorgc/report/Presupuesto_Report/${idRegistro}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.json(resp.data)
    // console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// agregar registro deleteInvoicesList
router.post('/deleteInvoicesList/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)
  // console.log(req.body.map)
  // Config para axios
  const idRegistro = req.params.id
  const updateData = {
    data: { deleteInvoicesList: req.body.map },
    result: { fields: ['Single_Line'], message: true, tasks: true },
  }
  const config = {
    method: 'patch',
    url: `https://creator.zoho.com/api/v2/sistemas134/cotizadorgc/report/Presupuesto_Report/${idRegistro}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    data: JSON.stringify(updateData),
  }

  // Realizar peticion con Axios
  try {
    // res.end()
    const resp = await axios(config)
    res.send(resp.data)
    //console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Modificar 1 registro de reporte Presupuesto
router.post('/updateRecord/:id', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  // Config para axios
  const idRegistro = req.params.id
  const updateData = {
    data: { NombreContacto: 'ALEJANDRO MEZA ZAMORA' },
    result: { fields: ['Single_Line'], message: true, tasks: true },
  }
  const config = {
    method: 'patch',
    url: `https://creator.zoho.com/api/v2/sistemas134/cotizadorgc/report/Presupuesto_Report/${idRegistro}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    data: JSON.stringify(updateData),
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    res.send(resp.data)
    //console.log(resp.data)
  } catch (error) {
    console.log(error)
  }
})

// Get registro por Folio
router.get('/searchRecord/:folio', async (req, res) => {
  // obtener access token
  const accessToken = await catalystToken(req)

  // Config para axios
  const config = {
    method: 'get',
    url: `https://creator.zoho.com/api/v2/sistemas134/cotizadorgc/report/Presupuesto_Report?Folio=${req.params.folio}`,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
  }

  // Realizar peticion con Axios
  try {
    const resp = await axios(config)
    // console.log(resp.data.data[0])
    res.json(resp.data.data[0])
  } catch (error) {
    console.log(error)
  }
})

module.exports = router
