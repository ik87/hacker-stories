import React, {useEffect, useRef, useState} from 'react'

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const initialStories = [
    {
        title: 'React',
        url: 'https://reactjs.org/',
        author: 'Jordan Walke',
        num_comments: 3,
        points: 4,
        objectID: 0,
    },
    {
        title: 'Redux',
        url: 'https://redux.js.org/',
        author: 'Dan Abramov, Andrew Clark',
        num_comments: 2,
        points: 5,
        objectID: 1,
    },
    {
        title: null,
        url: null,
        author: null,
        num_comments: null,
        points: null,
        objectID: null,
    }
];


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
                data: state.filter(
                    story => story.data.objectID !== action.payload.objectID
                )
            }
        default:
            throw new Error();
    }

}

const getAsyncStories = () =>
    new Promise(resolve =>
        setTimeout(
            () => resolve({data: {stories: initialStories}}), 2000));


const List = ({list, onRemoveItem}) =>

    list.map(item => <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem}/>)


const Item = ({item, onRemoveItem}) => {


    return (
        <div>
            <span>
                <a href={item.url}>{item.title}</a>
            </span>
            <span>{item.author}</span>
            <span>{item.num_comments}</span>
            <span>{item.points}</span>
            <span>
                <button type="button" onClick={() => onRemoveItem(item)}>
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

//repeat:
//(101) Data Fetching with React
//(103) Data Re-Fetching in React
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
            <label htmlFor={id}>{children}</label>
            {/* B */}
            <input
                //   ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
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
    //const [isLoading, setIsLoading] = React.useState(false);
    //const [isError, setIsError] = React.useState(false);
    const [stories, dispatchStories] = React.useReducer(
        storiesReducer,
        {
            data: [], isLoading: false, isError: false
        })

/*
* fetch(`${API_ENDPOINT}react`)
* // B .then(response => response.json()) // C .then(result => {
* dispatchStories({
* type: 'STORIES_FETCH_SUCCESS',
* payload: result.hits,
* // D
* }); })
* */
    React.useEffect(() => {
        if(!searchTerm) return;

        fetch(`${API_ENDPOINT}${searchTerm}`)
            .then(resonpse => resonpse.json())
            .then(result => {
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.hits
            })
        }).catch(() =>
            //setIsError(true)
            dispatchStories({type: 'STORIES_FETCH_FAILURE'})
        );
    }, [searchTerm]);

    const handleChange = event => {
        setSearchTerm(event.target.value)
    }

    const searchedStories = stories.data.filter(story => {
        return !!story.title && story.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    });

    const handleRemoveStory = item => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item
        })
    }


    return (
        <div>
            <h1>My Hacker Stories</h1>
            <InputWithLabel
                id="search"
                value={searchTerm}
                onInputChange={handleChange}
                isFocused
            >
                <StrongText value="Search:"/>
            </InputWithLabel>

            <hr/>
            {stories.isError && <p>Something went wrong...</p>}
            {stories.isLoading ? (<p>Loading...</p>) :
                (
                    //<List list={searchedStories} onRemoveItem={handleRemoveStory}/>
                    <List list={stories.data} onRemoveItem={handleRemoveStory}/>
                )}
        </div>
    )
}

export default App;
