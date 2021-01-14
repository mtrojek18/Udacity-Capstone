import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createShoppingListItem,
  deleteItem,
  getItems,
  patchItem
} from '../api/shoppinglist-api'
import Auth from '../auth/Auth'
import { ShoppingListItem } from '../types/ShoppingListItem'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  shoppingListItems: ShoppingListItem[]
  itemName: string
  quantity: number
  price: number
  loadingItems: boolean
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    shoppingListItems: [],
    itemName: '',
    quantity: 0,
    price: 0,
    loadingItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ itemName: event.target.value })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/shoppinglist/${itemId}/edit`)
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dateAdded = this.calculateDueDate()
      console.log('State Item Name: ' + this.state.itemName)
      console.log('State Quantity: ' + this.state.quantity)
      console.log('State Price: ' + this.state.price)
      const newItem = await createShoppingListItem(
        this.props.auth.getIdToken(),
        {
          item: this.state.itemName,
          quantity: this.state.quantity,
          price: this.state.price
        }
      )
      console.log('Item Added')
      this.setState({
        shoppingListItems: [...this.state.shoppingListItems, newItem],
        itemName: ''
      })
      console.log('Set state completed')
    } catch {
      alert('Item add failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        shoppingListItems: this.state.shoppingListItems.filter(
          (item) => item.itemId != itemId
        )
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  onItemCheck = async (pos: number) => {
    alert('on to check triggered')
    try {
      const item = this.state.shoppingListItems[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        item: item.item,
        quantity: item.quantity,
        price: item.price,
        done: !item.done
      })
      alert('patch ran')
      this.setState({
        shoppingListItems: update(this.state.shoppingListItems, {
          [pos]: { done: { $set: !item.done } }
        })
      })
    } catch {
      alert('Item deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        shoppingListItems: items,
        itemName: '',
        quantity: 1,
        price: 1,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch items: ${e.message}`)
    }
    console.log('Here are the items: ' + this.state.shoppingListItems)
  }

  render() {
    return (
      <div>
        <Header as="h1">Shopping List</Header>

        {this.renderCreateItemInput()}

        {this.renderItems()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onItemCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderItems() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderItemsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Shopping List
        </Loader>
      </Grid.Row>
    )
  }

  renderItemsList() {
    console.log('Start Rendering Item List')
    console.log(this.state.shoppingListItems)
    return (
      <Grid padded>
        {this.state.shoppingListItems.map((item, pos) => {
          return (
            <Grid.Row key={item.itemId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {item.item}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {item.dateAdded}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {item.attachmentUrl && (
                <Image src={item.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
