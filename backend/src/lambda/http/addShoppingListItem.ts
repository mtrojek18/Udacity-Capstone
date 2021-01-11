require('source-map-support').install();
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { addToShoppingList } from '../../businessLogic/shoppingList';
import { AddItemRequest } from '../../requests/AddItemRequest'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const shoppingListItem: AddItemRequest = JSON.parse(event.body)

  if (shoppingListItem.item === '' || shoppingListItem.price === 0 || shoppingListItem.quantity === 0) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: "Item, Price & Quantity Required!"
    }
    
  }

  const addShoppingListItem = await addToShoppingList(shoppingListItem, jwtToken)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item: addShoppingListItem
    })
  }
}
