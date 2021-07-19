const config = {
    client: {
      id: '<client-id>',
      secret: '<client-secret>'
    },
    auth: {
      tokenHost: 'https://api.oauth.com'
    }
  };
   
  const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');