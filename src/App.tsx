import { Route, Routes } from 'react-router';
import { SiteLayout } from './components/SiteLayout';
import Home from './pages/Home';
import Work from './pages/Work';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Writing from './pages/Writing';
import Article from './pages/Article';
import Concept from './pages/Concept';
import Contact from './pages/Contact';
import PrintResume from './pages/PrintResume';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Standalone print target for `npm run resume:pdf` — no site chrome. */}
      <Route path="/print/resume" element={<PrintResume />} />
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:slug" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/writing/notes/:slug" element={<Article />} />
        <Route path="/writing/concepts/:slug" element={<Concept />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
