import React, {useEffect, useRef, useState} from 'react'

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
// Imperative React
// (80) Inline Handler in JSX
// (86) React Asynchronous Data
// (88) React Conditional Rendering
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
    const [stories, setStories] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isError, setIsError] = React.useState(false);


    React.useEffect(() => {
        setIsLoading(true);
        getAsyncStories().then(result => {
            setStories(result.data.stories);
            setIsLoading(false);
        }).catch(() => setIsError(true));
    }, []);

    const handleChange = event => {
        setSearchTerm(event.target.value)
    }

    const searchedStories = stories.filter(story => {
        return !!story.title && story.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    });

    const handleRemoveStory = item => {
        const newStories = stories.filter(
            story => item.objectID !== story.objectID
        )
        setStories(newStories);
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
            {isError && <p>Something went wrong...</p>}
            {isLoading ? (<p>Loading...</p>) :
                (
                    <List list={searchedStories} onRemoveItem={handleRemoveStory}/>
                )}
        </div>
    )
}

export default App;
