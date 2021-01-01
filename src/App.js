import React from 'react'


const List = ({list}) =>

    list.map(item => <Item key={item.objectID} {...item} />)


const Item = ({title, url, author, num_comments, points}) => (

    <div>
            <span>
                <a href={url}>{title}</a>
            </span>
        <span>{author}</span>
        <span>{num_comments}</span>
        <span>{points}</span>
    </div>
)


const Search = ({search, onSearch}) => {

    return (
        <div>
            <h1>My Hacker Stories</h1>
            <label htmlFor="search">Search: </label>
            <input id="search" type="text" value={search} onChange={onSearch}/>
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

const App = () => {
    const stories = [
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



    const [searchTerm, setSearchTerm] = userSemiPersistentSate("search", 'React');


    const handleChange = event => {
        setSearchTerm(event.target.value)
    }

    const searchedStories = stories.filter(story => {
        return !!story.title && story.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
    });




    return (
        <div>
            <Search search={searchTerm} onSearch={handleChange}/>
            <hr/>
            <List list={searchedStories}/>

        </div>
    )
}

export default App;
