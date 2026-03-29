import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { DiscussionProvider } from './contexts/DiscussionContext';
import Landing from './components/Landing/Landing';
import DomainSelector from './components/DomainSelector/DomainSelector';
import OfficeView from './components/Office/OfficeScene';
import SummaryView from './components/Summary/SummaryView';
import ExecutionPlan from './components/ExecutionPlan/ExecutionPlan';
import LaunchPad from './components/LaunchPad/LaunchPad';

export default function App() {
  return (
    <ThemeProvider>
      <DiscussionProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<DomainSelector />} />
          <Route path="/office/:id" element={<OfficeView />} />
          <Route path="/summary/:id" element={<SummaryView />} />
          <Route path="/plan/:id" element={<ExecutionPlan />} />
          <Route path="/launch/:id" element={<LaunchPad />} />
        </Routes>
      </DiscussionProvider>
    </ThemeProvider>
  );
}
