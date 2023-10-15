function App() {
    const { Container, Row, Col } = ReactBootstrap;
    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    //<TodoListCard />
		    <TodoLists />
                </Col>
            </Row>
        </Container>
    );
}

function TodoListCard() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    const onNewItem = React.useCallback(
        newItem => {
            setItems([...items, newItem]);
        },
        [items],
    );

    const onItemUpdate = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([
                ...items.slice(0, index),
                item,
                ...items.slice(index + 1),
            ]);
        },
        [items],
    );

    const onItemRemoval = React.useCallback(
        item => {
            const index = items.findIndex(i => i.id === item.id);
            setItems([...items.slice(0, index), ...items.slice(index + 1)]);
        },
        [items],
    );

    if (items === null) return 'Loading...';

    return (
        <React.Fragment>
            <AddItemForm onNewItem={onNewItem} />
            {items.length === 0 && (
		<p className="text-center">You have no to-do items yet! Add one above!</p>
            )}
            {items.map(item => (
                <ItemDisplay
                    item={item}
                    key={item.id}
                    onItemUpdate={onItemUpdate}
                    onItemRemoval={onItemRemoval}
                />
            ))}
        </React.Fragment>
    );
}

function AddItemForm({ onNewItem }) {
    const { Form, InputGroup, Button } = ReactBootstrap;

    const [newItem, setNewItem] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);

    const submitNewItem = e => {
        e.preventDefault();
        setSubmitting(true);
        fetch('/items', {
            method: 'POST',
            body: JSON.stringify({ name: newItem }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(item => {
                onNewItem(item);
                setSubmitting(false);
                setNewItem('');
            });
    };

    return (
        <Form onSubmit={submitNewItem}>
            <InputGroup className="mb-3">
                <Form.Control
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    type="text"
                    placeholder="New Item"
                    aria-describedby="basic-addon1"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={!newItem.length}
                        className={submitting ? 'disabled' : ''}
                    >
                        {submitting ? 'Adding...' : 'Add Item'}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

function ItemDisplay({ item, onItemUpdate, onItemRemoval }) {
    const { Container, Row, Col, Button } = ReactBootstrap;

    const toggleCompletion = () => {
        fetch(`/items/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: item.name,
                completed: !item.completed,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then(onItemUpdate);
    };

    const removeItem = () => {
        fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
            onItemRemoval(item),
        );
    };

    return (
        <Container fluid className={`item ${item.completed && 'completed'}`}>
            <Row>
                <Col xs={1} className="text-center">
                    <Button
                        className="toggles"
                        size="sm"
                        variant="link"
                        onClick={toggleCompletion}
                        aria-label={
                            item.completed
                                ? 'Mark item as incomplete'
                                : 'Mark item as complete'
                        }
                    >
                        <i
                            className={`far ${
                                item.completed ? 'fa-check-square' : 'fa-square'
                            }`}
                        />
                    </Button>
                </Col>
                <Col xs={10} className="name">
                    {item.name}
                </Col>
                <Col xs={1} className="text-center remove">
                    <Button
                        size="sm"
                        variant="link"
                        onClick={removeItem}
                        aria-label="Remove Item"
                    >
                        <i className="fa fa-trash text-danger" />
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

// New component: multiple lists

function TodoLists() {
  const [lists, setLists] = React.useState([]);
  const [activeList, setActiveList] = React.useState(null);

  // Function to create a new to-do list
  const createList = () => {
    const newList = {
      id: Date.now(), // Generate a unique ID
      name: 'New List',
      items: [],
    };

    setLists([...lists, newList]);
  };

  // Function to switch to a different to-do list
  const switchToList = (listId) => {
    setActiveList(listId);
  };

  // Function to add a new item to the active list
  const addItemToActiveList = (newItem) => {
    if (activeList !== null) {
      const updatedLists = lists.map((list) => {
        if (list.id === activeList) {
          return {
            ...list,
            items: [...list.items, newItem],
          };
        }
        return list;
      });

      setLists(updatedLists);
    }
  };

  // Function to update an item in the active list
  const updateItemInActiveList = (updatedItem) => {
    if (activeList !== null) {
      const updatedLists = lists.map((list) => {
        if (list.id === activeList) {
          const updatedItems = list.items.map((item) => {
            if (item.id === updatedItem.id) {
              return updatedItem;
            }
            return item;
          });
          return {
            ...list,
            items: updatedItems,
          };
        }
        return list;
      });

      setLists(updatedLists);
    }
  };

  // Function to remove an item from the active list
  const removeItemFromActiveList = (itemId) => {
    if (activeList !== null) {
      const updatedLists = lists.map((list) => {
        if (list.id === activeList) {
          const filteredItems = list.items.filter((item) => item.id !== itemId);
          return {
            ...list,
            items: filteredItems,
          };
        }
        return list;
      });

      setLists(updatedLists);
    }
  };

  return (
    <div>
      <h2>Multiple To-Do Lists</h2>

      <div>
        <button onClick={createList}>Create New List</button>
      </div>

      <div>
        {lists.map((list) => (
          <div key={list.id}>
            <button onClick={() => switchToList(list.id)}>
              {list.name}
            </button>
          </div>
        ))}
      </div>

      {activeList !== null && (
        <div>
          <TodoListCard
            key={activeList}
            items={lists.find((list) => list.id === activeList).items}
            onNewItem={addItemToActiveList}
            onItemUpdate={updateItemInActiveList}
            onItemRemoval={removeItemFromActiveList}
          />
        </div>
      )}
    </div>
  );
}

// End of component

ReactDOM.render(<App />, document.getElementById('root'));
