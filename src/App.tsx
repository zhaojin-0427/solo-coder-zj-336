import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Archive from "@/pages/Archive";
import Records from "@/pages/Records";
import RecordDetail from "@/pages/RecordDetail";
import PatternReview from "@/pages/PatternReview";
import Review from "@/pages/Review";
import Stats from "@/pages/Stats";
import Experience from "@/pages/Experience";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/:id" element={<RecordDetail />} />
          <Route path="/pattern-review" element={<PatternReview />} />
          <Route path="/review" element={<Review />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </Router>
  );
}
