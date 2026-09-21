import path from 'node:path'
import fs from 'node:fs/promises'
import { sendResponse } from './sendResponse.js'
import { getContentType } from './getContentType.js'

export async function serveStatic(req, res, baseDir){
    try {
        const publicDir = path.join(baseDir , 'public')
        const pathToResource = path.join(
            publicDir,
            req.url === '/' ? 'index.html' : req.url
        )
        
        const content = await fs.readFile(pathToResource)
        sendResponse(res, 200, getContentType(path.extname (pathToResource)), content)
        console.log(pathToResource)
    } catch (err) {
        console.log(err)
    }
}