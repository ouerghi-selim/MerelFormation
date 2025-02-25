// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import HomePage from './pages/homepage.tsx';
// import FormationsPage from './pages/formations-page.tsx';
// import LocationPage from './pages/location-page.tsx';
// function App() {
//   // const [count, setCount] = useState(0)
//     return (
//         <Router>
//             <Routes>
//                 <Route path="/" element={<HomePage />} />
//                 <Route path="/formations" element={<FormationsPage />} />
//                 <Route path="/location" element={<LocationPage />} />
//             </Routes>
//         </Router>
//     )
// }
// //   return (
// //     <>
// //       <div>
// //         <a href="https://vite.dev" target="_blank">
// //           <img src={viteLogo} className="logo" alt="Vite logo" />
// //         </a>
// //         <a href="https://react.dev" target="_blank">
// //           <img src={reactLogo} className="logo react" alt="React logo" />
// //         </a>
// //       </div>
// //       <h1>Vite + React</h1>
// //       <div className="card">
// //         <button onClick={() => setCount((count) => count + 1)}>
// //           count is {count}
// //         </button>
// //         <p>
// //           Edit <code>src/App.tsx</code> and save to test HMR
// //         </p>
// //       </div>
// //       <p className="read-the-docs">
// //         Click on the Vite and React logos to learn more
// //       </p>
// //     </>
// //   )
// // }
// const root = ReactDOM.createRoot(document.getElementById('root')!);
// root.render(<App />);
// // export default App
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/home-page';
import FormationsPage from '@/pages/formations-page';
import LocationPage from '@/pages/location-page';
import FormationInitialePage from "@/pages/formation-initial-page.tsx";
import ContactPage from "@/pages/contact-page.tsx";
import LoginPage from "@/pages/login-page.tsx";


const App = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/formations" element={<FormationsPage />} />
                    <Route path="/formations/initial" element={<FormationInitialePage />} />
                    <Route path="/location" element={<LocationPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;