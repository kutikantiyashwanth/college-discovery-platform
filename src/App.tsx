import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DiscussionProvider } from './context/DiscussionContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CollegesPage } from './pages/CollegesPage';
import { CollegeDetailPage } from './pages/CollegeDetailPage';
import { ComparePage } from './pages/ComparePage';
import { PredictorPage } from './pages/PredictorPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { DiscussionDetailPage } from './pages/DiscussionDetailPage';
import { SavedPage } from './pages/SavedPage';
import { useCompare } from './hooks/useCompare';
import './App.css';

function AppInner() {
  const { compareList, addToCompare, removeFromCompare, isInCompare, clearCompare, canAdd } = useCompare();

  const handleCompareToggle = (id: string) => {
    if (isInCompare(id)) removeFromCompare(id);
    else addToCompare(id);
  };

  return (
    <div className="app-root">
      <Navbar compareCount={compareList.length} />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/colleges"
            element={
              <CollegesPage
                compareList={compareList}
                canAdd={canAdd}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
          <Route path="/colleges/:id" element={<CollegeDetailPage />} />
          <Route
            path="/compare"
            element={
              <ComparePage
                compareList={compareList}
                onRemove={removeFromCompare}
                onClear={clearCompare}
              />
            }
          />
          <Route
            path="/predictor"
            element={
              <PredictorPage
                compareList={compareList}
                canAdd={canAdd}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
          <Route path="/discussions" element={<DiscussionPage />} />
          <Route path="/discussions/:id" element={<DiscussionDetailPage />} />
          <Route
            path="/saved"
            element={
              <SavedPage
                compareList={compareList}
                onCompareToggle={handleCompareToggle}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {compareList.length > 0 && (
        <div className="compare-bar">
          <span className="compare-bar-text">
            {compareList.length} college{compareList.length > 1 ? 's' : ''} selected for comparison
          </span>
          <div className="compare-bar-actions">
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 8 }} onClick={clearCompare}>
              Clear
            </button>
            <Link to="/compare" className="btn btn-primary btn-sm">Compare Now →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DiscussionProvider>
          <AppInner />
        </DiscussionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
