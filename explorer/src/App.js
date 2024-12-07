import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Explorer from './pages/Explorer/Explorer';
import GraphList from './pages/GraphList/GraphList';

function App() {
  return (
    <Routes>
    <Route path="/" element={ <Explorer />} />
  <Route path="/graph" element={ <GraphList />} />
</Routes>
  );
}

export default App;
