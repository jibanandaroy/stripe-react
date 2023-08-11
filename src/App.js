import React from 'react';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Layout from './component/Layout';
import StripeComponent from './component/StripeComponent';

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path="/" element={<Layout/>}></Route>
    <Route path="/stripe" element={<StripeComponent/>}></Route>
   </Routes>
   </BrowserRouter>
  );
}

export default App;
