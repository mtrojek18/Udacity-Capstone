import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { ShoppingListItem } from '../models/ShoppingListItem'
import { ItemUpdate } from '../models/ItemUpdate'
import { createLogger } from '../utils/logger'

const logger = createLogger('items')

export class ShoppingListAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly shoppingListTable = process.env.SHOPPING_LIST_TABLE,
    private readonly indexName = process.env.LIST_ID_INDEX) {
  }

  //============================================================
  // Getting all items on my shopping list
  //=============================== =============================
  async getItemsOnShoppingList(userId: string): Promise<ShoppingListItem[]> {
    const result = await this.docClient.query({
      TableName: this.shoppingListTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as ShoppingListItem[]
  }

  //============================================================
  // Add Item to Shopping List
  //============================================================
  async addToShoppingList(item: ShoppingListItem): Promise<ShoppingListItem> {
    await this.docClient.put({
      TableName: this.shoppingListTable,
      Item: item
    }).promise()

    return item
  }

  //============================================================
  // Delete Shopping List Item
  //============================================================
  async deleteItem(itemId: string, userId: string ): Promise<void> {
    await this.docClient.delete({
      TableName: this.shoppingListTable,
      Key: {
        itemId,
        userId
    }
    }).promise()   
  }

  //============================================================
  // Update Shopping List Item
  //============================================================
  async updateShoppingListItem(itemId: string, userId: string, itemUpdate: ItemUpdate,  ): Promise<void> {
    await this.docClient.update({
      TableName: this.shoppingListTable,
      Key: {
        itemId,
        userId
      },
      UpdateExpression: 'set #n = :item, done = :done',
      ExpressionAttributeValues: {
        ':item': itemUpdate.item,
        ':done': itemUpdate.done,
        //':dueDate': itemUpdate.dueDate,
      },
      ExpressionAttributeNames: {
        '#n': 'item'
      },
    }).promise()   
  }

  //============================================================
  // Update Item Image Url
  //============================================================
  async updateItemUrl(itemId: string, userId: string): Promise<void> {

    let attachmentUrl: string = 'https://' + process.env.S3_BUCKET + '.s3.amazonaws.com/' + itemId

    logger.info(attachmentUrl);
      
      try {
             
        logger.info("item id: "+itemId)
        logger.info("user id"+userId)
        
        await this.docClient.update({
          TableName: this.shoppingListTable,
          Key: {
             userId,
             itemId 
          },
          UpdateExpression: "SET attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl
          }            
        }, function(err,data){
            if (err) {
              logger.info(err)
            } else {
              logger.info(data)
        }
        }).promise()

        logger.info("Attachment Update Complete")
  
      }
      catch (err) {
        console.log("Failure: "+err.message)
      } finally {
        console.log("Finally Hit")
      }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
