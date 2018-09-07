# ClassRecorder

This WebApp leverages GetUserMedia and MediaStreams API's along with IndexedDB to record user feedback and make the clips searchable.

This is a prototype of a recorder designed for classroom to capture verbal feedback & thinking. Traditional dictaphones make it difficult to search through recorded data, this aims to store clips in a way that is more readilly searchable.

## Design Notes
- Uses gulp build scripts
- Uses IndexedDB for offline data storage
- Uses sass for styling
- Uses MediaStream API


## Installation

### Dependancies
- [Node & npm](https://nodejs.org/en/)

### Running the app
- Clone the repository
- Navigate to the project directory in command line
- run command `npm install`
- run command `gulp`

The server is not running on [https://localserver:3000](https://localserver:3000)

## Implementation Notes

Currently the various parts of the app are not separated into modules - with separate files loaded in script tags in the html.

`app.js` is an immediately-invoked function expression so that it exposes only the relevant properties and functions.

Three Javascript classes are used 
** StudentSelectModel** - forselecting students (to tag audio clips with for searching)
** FilterModel** - for defining a filter to search through recorded clips
** DBHelper** - for interfacing with indexedDB database (retrieving/storing data)

`app.js` contains
- functions that render the HTML for the page from the relevant StudentSelect/Filter Models
- event listener declarations on various interactive pieces of the page
