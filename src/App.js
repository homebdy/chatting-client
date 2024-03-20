import React from "react";
import { BrowserRouter, Route, Routes,  } from "react-router-dom";
import CreateReadChat from "./CreateReadChat";

const App = () => {
	return (
		<div className='App'>
      <BrowserRouter>
        <Routes>
          <Route path="/chat/:room" element={<CreateReadChat />} />
        </Routes>
      </BrowserRouter>
		</div>
	);
};
export default App;