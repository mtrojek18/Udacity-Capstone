import { apiEndpoint } from '../config'
import { ShoppingListItem } from '../types/ShoppingListItem';
import { AddItemRequest } from '../types/AddItemRequest';
import Axios from 'axios'
import { UpdateItemRequest } from '../types/UpdateItemRequest';

export async function getItems(idToken: string): Promise<ShoppingListItem[]> {
  console.log('Fetching Shopping List Items')

  const response = await Axios.get(`${apiEndpoint}/shoppinglist`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('ShoppingList:', response.data)
  return response.data.items
}

export async function createShoppingListItem(
  idToken: string,
  newItem: AddItemRequest
): Promise<ShoppingListItem> {
  const response = await Axios.post(`${apiEndpoint}/shoppinglist`,  JSON.stringify(newItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchItem(
  idToken: string,
  itemId: string,
  updatedItem: UpdateItemRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/shoppinglist/${itemId}`, JSON.stringify(updatedItem), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteItem(
  idToken: string,
  itemId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/shoppinglist/${itemId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  itemId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/shoppinglist/${itemId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
