// import ReactDOM from 'react-dom/client';
// import './index.css';
//
// const App = () => (
//     <div>
//         <h1>Welcome to MerelFormation</h1>
//         <p>This is your Vite + React setup.</p>
//     </div>
// );
//
// const root = ReactDOM.createRoot(document.getElementById('root')!);
// root.render(<App />);

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './assets/animations.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)