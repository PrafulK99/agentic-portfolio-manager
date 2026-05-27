import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../components/Layout'
import Dashboard from './Dashboard'
import Analyze from './Analyze'
import History from './History'
import Portfolio from './Portfolio'
import PortfolioDetail from './PortfolioDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="analyze" element={<Analyze />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:symbol" element={<PortfolioDetail />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
