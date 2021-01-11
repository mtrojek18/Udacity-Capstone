import * as uuid from 'uuid'
import { ShoppingListItem } from '../models/ShoppingListItem'
import { ShoppingListAccess } from '../dataLayer/shoppingListAccess'
import { AddItemRequest } from '../requests/AddItemRequest'
import { UpdateItemRequest } from '../requests/UpdateItemRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'

const logger = createLogger('shoppinglist')

const shoppingListAccess = new ShoppingListAccess()

//============================================================
// Getting all Items on your shopping List
//============================================================
export async function getItemsOnShoppingList(jwtToken: string): Promise<ShoppingListItem[]> {
  const userId = parseUserId(jwtToken)
  return shoppingListAccess.getItemsOnShoppingList(userId)
}

//============================================================
// Add Item to Shopping List
//============================================================
export async function addToShoppingList(
  AddItemRequest: AddItemRequest,
  jwtToken: string
): Promise<ShoppingListItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  return await shoppingListAccess.addToShoppingList({
    userId: userId,
    itemId: itemId,    
    item: AddItemRequest.item,
    quantity: AddItemRequest.quantity,
    price: AddItemRequest.price,
    lineAmount: AddItemRequest.price * AddItemRequest.quantity,
    dateAdded: new Date().toISOString(),
    done: false
  })
}

//============================================================
// Delete Shopping List Item
//============================================================
export async function deleteShoppingListItem(
  itemId: string,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)
  await shoppingListAccess.deleteItem(itemId, userId)
}

//============================================================
// Update Shopping List Item
//============================================================
export async function updateShoppingListItem(
  itemId: string,
  UpdateItemRequest: UpdateItemRequest,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)

  await shoppingListAccess.updateShoppingListItem(itemId, userId, UpdateItemRequest)

}

//============================================================
// Update Item Image Url
//============================================================
export async function updateItemUrl(
  itemId: string,
  jwtToken: string
): Promise<void> {

  const userId = parseUserId(jwtToken)
  logger.info("User ID:"+userId);

  logger.info("Start business Logic Call")
  await shoppingListAccess.updateItemUrl(itemId, userId)
  logger.info("End business Logic Call")

}