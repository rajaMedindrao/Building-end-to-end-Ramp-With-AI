import './App.css'
import {
  Nav,
  Hero,
  LogosStrip,
  LunchBreak,
  Testimonials,
  ThreeWays,
  CustomerGrid,
  MoreTime,
  ForbesCallout,
  Footer,
} from './components/sections.jsx'

export default function App() {
  return (
    <div className="page">
      <Nav />
      <Hero />
      <LogosStrip />
      <LunchBreak />
      <Testimonials />
      <ThreeWays />
      <CustomerGrid />
      <MoreTime />
      <ForbesCallout />
      <Footer />
    </div>
  )
}
