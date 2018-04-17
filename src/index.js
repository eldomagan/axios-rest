import Requestor from './Requestor'

function axiosRestClient(config) {
  if (!config.baseUrl) {
    throw new Error('config.baseUrl is required')
  }

  const requestor = new Requestor(config)
  const apiProxy = new Proxy(requestor, {
    get (requestor, prop) {
      return prop in requestor ? requestor[prop] : requestor.endpoint(prop)
    }
  })

  return apiProxy
}

export default axiosRestClient
