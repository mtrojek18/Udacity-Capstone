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
  Loader,
  Segment
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

  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      this.setState({ quantity: parseInt(event.target.value) })
    } catch (error) {
      this.setState({ quantity: 1 })
    }
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      this.setState({ price: parseInt(event.target.value) })
    } catch (error) {
      this.setState({ price: 0.99 })
    }
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/shoppinglist/${itemId}/edit`)
  }

  onItemCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      console.log(event)
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
    try {
      const item = this.state.shoppingListItems[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        item: item.item,
        quantity: item.quantity,
        price: item.price,
        done: !item.done
      })
      this.setState({
        shoppingListItems: update(this.state.shoppingListItems, {
          [pos]: { done: { $set: !item.done } }
        })
      })
    } catch {
      alert('Item Check failed')
    }
  }

  onAddQuantity = async (pos: number) => {
    try {
      const item = this.state.shoppingListItems[pos]
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        item: item.item,
        quantity: item.quantity + 1,
        price: item.price,
        done: item.done
      })
      this.setState({
        shoppingListItems: update(this.state.shoppingListItems, {
          [pos]: { quantity: { $set: item.quantity + 1 } }
        })
      })
    } catch {
      alert('Item Patch failed')
    }
  }

  onMinusQuantity = async (pos: number) => {
    try {
      const item = this.state.shoppingListItems[pos]
      let qtyToUpdate = item.quantity - 1
      if (qtyToUpdate < 0) {
        qtyToUpdate = 0
      }
      await patchItem(this.props.auth.getIdToken(), item.itemId, {
        item: item.item,
        quantity: qtyToUpdate,
        price: item.price,
        done: item.done
      })
      this.setState({
        shoppingListItems: update(this.state.shoppingListItems, {
          [pos]: { quantity: { $set: qtyToUpdate } }
        })
      })
    } catch {
      alert('Item Patch failed')
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
      <React.Fragment>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <Input
                action={{
                  color: 'teal',
                  labelPosition: 'left',
                  icon: 'add',
                  content: 'Add Item',
                  onClick: this.onItemCreate
                }}
                // fluid
                actionPosition="left"
                placeholder="Add Shopping List Item Here..."
                onChange={this.handleNameChange}
              />
            </Grid.Column>
            <Grid.Column>
              <Input
                placeholder="Quantity"
                onChange={this.handleQuantityChange}
              ></Input>
            </Grid.Column>
            <Grid.Column>
              <Input
                placeholder="Price"
                onChange={this.handlePriceChange}
              ></Input>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
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
      <Grid celled>
        {this.state.shoppingListItems.map((item, pos) => {
          return (
            <Grid.Row verticalAlign="middle" key={item.itemId}>
              <Grid.Column width={1}>
                <Checkbox
                  onChange={() => this.onItemCheck(pos)}
                  checked={item.done}
                />
              </Grid.Column>
              <Grid.Column width={3}>
                {/* <Image src="https://react.semantic-ui.com/images/wireframe/image.png" /> */}
                {item.attachmentUrl && (
                  <Image src={item.attachmentUrl} size="small" wrapped />
                )}
              </Grid.Column>
              <Grid.Column width={3}>{item.item}</Grid.Column>
              <Grid.Column width={4}>
                <Button
                  icon
                  color="grey"
                  onClick={() => this.onMinusQuantity(pos)}
                >
                  <Icon name="minus" />
                </Button>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                {item.quantity}
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>

                <Button
                  icon
                  color="grey"
                  onClick={() => this.onAddQuantity(pos)}
                >
                  <Icon name="add" />
                </Button>
              </Grid.Column>
              <Grid.Column width={2}>
                <Segment>${item.price} / ea</Segment>
              </Grid.Column>
              <Grid.Column width={2}>
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(item.itemId)}
                >
                  <Icon name="edit outline" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onItemDelete(item.itemId)}
                >
                  <Icon name="trash alternate" />
                </Button>
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
