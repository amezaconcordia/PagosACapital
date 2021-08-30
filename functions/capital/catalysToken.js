const catalyst = require('zcatalyst-sdk-node')
// inicializar sdk de zoho catalyst
const catalystToken = async (req) => {
  // inicializar sdk de zoho catalyst
  const appCatalyst = catalyst.initialize(req)
  // connector para obtener access token utilizando credenciales
  const connector = appCatalyst
    .connection({
      ConnectorName: {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        auth_url: 'https://accounts.zoho.com/oauth/v2/token',
        refresh_url: 'https://accounts.zoho.com/oauth/v2/token',
        refresh_token: process.env.REFRESH_TOKEN,
      },
    })
    .getConnector('ConnectorName')
  // obtener access token
  return await connector.getAccessToken()
}

module.exports = catalystToken
