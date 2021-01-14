require('source-map-support').install();
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateItemRequest } from '../../requests/UpdateItemRequest'
import { updateShoppingListItem } from '../../businessLogic/shoppingList'
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const logger = createLogger('Items')

  const itemId = event.pathParameters.itemId
  const updatedItem: UpdateItemRequest = JSON.parse(event.body)

  logger.info("Updated Item:"+updatedItem);

  await updateShoppingListItem(itemId, updatedItem, jwtToken);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null   
  }
}
