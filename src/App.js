import React from 'react'
import axios from 'axios'
import styles from './App.module.css';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const storiesReducer = (state, action) => {

    switch (action.type) {
        case 'STORIES_FETCH_INIT' :
            return {
                ...state,
                isLoading: true,
                isError: false
            }
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload
            }
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true
            }

        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    story => story.objectID !== action.payload.objectID
                )
            }
        default:
            throw new Error();
    }

}


const List = ({list, onRemoveItem}) =>

    list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>)


const Item = ({item, onRemoveItem}) => {


    return (
        <div className={styles.item}>
            <span style={{ width: '40%' }}>
                <a href={item.url}>{item.title}</a>
            </span>
            <span style={{ width: '30%' }}>{item.author}</span>
            <span style={{width: '10%' }}>{item.num_comments}</span>
            <span style={{ width: '10%' }}>{item.points}</span>
            <span style={{ width: '10%' }}>
                <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    className={`${styles.button} ${styles.buttonSmall}`}
                >
                    Dismiss
                </button>
            </span>
        </div>
    )
}

const userSemiPersistentSate = (key, initialState) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    )
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
        localStorage.setItem(key, value);
    }, [value, key])
    return [value, setValue]
}

const SearchForm = ({
                        searchTerm,
                        onSearchInput,
                        onSearchSubmit
                    }) => (
    <form onSubmit={onSearchSubmit}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            onInputChange={onSearchInput}
            isFocused
        >
            <StrongText value="Search:"/>
        </InputWithLabel>
        <button
            type="submit"
            disabled={!searchTerm}
            className={`${styles.button} ${styles.buttonLarge}`}
        >
            Submit
        </button>
    </form>
)

//repeat:
//(126) CSS in React
//(132) CSS Modules in React
const InputWithLabel = ({id, value, onInputChange, type = 'text', isFocused, children}) => {
    // A
    const inputRef = React.useRef();
    // C
    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            // D
            inputRef.current.focus();
        }
    }, [isFocused])

    return (
        <>
            <label htmlFor={id} className={styles.label}>{children}</label>
            {/* B */}
            <input
                //   ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
                className={styles.input}
            />
        </>
    )
}

const StrongText = ({value}) => (
    <>
        <strong>{value}</strong>
    </>
)

const App = () => {


    const [searchTerm, setSearchTerm] = userSemiPersistentSate("search", '');
    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {
            data: [], isLoading: false, isError: false
        })

    const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`)

    const handleSearchInput = event => {
        setSearchTerm(event.target.value)
    }

    const handleSearchSubmit = event => {
        setUrl(`${API_ENDPOINT}${searchTerm}`)
        event.preventDefault()
    }

    const handlerFetchStories = React.useCallback(async () => {
        dispatchStories({type: 'STORIES_FETCH_INIT'})
        try {
            const result = await axios.get(url)

            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits
            })
        } catch {
            dispatchStories({type: 'STORIES_FETCH_FAILURE'})
        }

    }, [url])

    React.useEffect(() => {
        handlerFetchStories();
    }, [handlerFetchStories])

    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        })
    }


    return (
        <div className={styles.container}>
            <h1 className={styles.headlinePrimary}>My Hacker Stories</h1>
            <SearchForm
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
                searchTerm={searchTerm}
            />
            {stories.isError && <p>Something went wrong...</p>}
            {stories.isLoading ? (<p>Loading...</p>) :
                (
                    <List list={stories.data} onRemoveItem={handleRemoveStory}/>
                )}
        </div>
    )
}

export default App;
