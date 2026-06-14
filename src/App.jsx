import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Journal from './pages/Journal';
import RiskOfficer from './pages/RiskOfficer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
        {/* <Route path="/" element={<Journal />} /> */}
          <Route path="/risk-officer" element={<RiskOfficer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
