import Requestor from './Requestor'

export default function axiosRest(config) {
  if (!config.baseUrl) {
    throw new Error('config.baseUrl is required')
  }

  const requestor = new Requestor(config)
  const apiProxy = new Proxy(requestor, {
    get (requestor, attr) {
      return attr in requestor ? requestor[attr] : requestor.api(attr)
    }
  })

  return apiProxy
}
