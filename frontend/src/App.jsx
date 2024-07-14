import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"


function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <div className="appContainer">
        <Routes>
          <Route path='/' element={<h1>Dashboard</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
