import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Journal from './pages/Journal';
import RiskOfficer from './pages/RiskOfficer';
import RiskOfficePro from './pages/RiskOfficePro';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/risk-office-pro" replace />} />
          <Route path="/journal" element={<Journal />} />
         <Route path='/risk-officer' element={<RiskOfficer/>}/>
          <Route path="/risk-office-pro" element={<RiskOfficePro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
