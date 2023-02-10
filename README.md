# TradeNet

This project is a web application built using React.js and Cytoscape.js that allows users to explore the history of NBA player transactions by visualizing them as a graph. The application uses data parsed from prosportstransactions.com using Beautiful Soup to construct the graph.

Users can select a player and (optionally) another player who has been involved in a trade with them. The application also allows users to specify the number of additional exchanges to include in the graph, providing a way to control its size and complexity. By clicking on the edges between nodes, users can view extra information about the trades.

## Deployment

Deployed using Netlify at https://tradenet.netlify.app/

## Acknowledgements

 - [Data](https://prosportstransactions.com)
 - [Inspiration](https://github.com/svitkin/bball-trade-network)

## Notes

- Scrape folder contains python notebook used to scrape for nodes.csv, edges.csv, and trades.csv 
- src folder contains the react app, most importantly the three tabs of the application


## Building and Running the Application

### 1. Install the dependencies:

`yarn install`

### 2. Building the Application:

`yarn build`

Builds app for production to the `build` folder.

### 3. Running the Application:

`yarn start`

Runs app in the development mode. Open http://localhost:3000 to view it in the browser.
