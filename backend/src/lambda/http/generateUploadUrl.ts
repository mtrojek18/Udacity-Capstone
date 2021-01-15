require('source-map-support').install();
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { updateItemUrl } from '../../businessLogic/shoppingList';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const logger = createLogger('item_url')
  const itemId = event.pathParameters.itemId

  const s3 = new AWS.S3({ 
    signatureVersion: 'v4' 
  });

  const presignedUploadUrl = s3.getSignedUrl('putObject', {
    Bucket: process.env.S3_BUCKET,
    Key: itemId,
    Expires: parseInt(process.env.SIGNED_URL_EXPIRATION)
  })

  logger.info("Presigned URL: "+presignedUploadUrl)

  try {
    await updateItemUrl(itemId,jwtToken)
  } catch (error) {
    logger.info(error)
  }
  
  logger.info("Presigned url generated successfully ", presignedUploadUrl)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: presignedUploadUrl
    })
  }
}

