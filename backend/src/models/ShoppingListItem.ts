export interface ShoppingListItem {
  userId: string
  itemId: string
  item: string
  quantity: number
  price: number
  lineAmount: number
  dateAdded: string
  done: boolean
  attachmentUrl?: string
}
