export function sendResponse (res, statusCode, ContentType, payload) {

    res.statusCode = statusCode
    res.setHeader('Content-Types' , ContentType)
    res.end(payload)

}