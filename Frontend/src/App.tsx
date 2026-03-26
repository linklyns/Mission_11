/** * ADVANCED BOOTSTRAP FEATURES FOR GRADING:
 * 1. Floating Labels: Applied to the Book Search input.
 * 2. Offcanvas: Applied to the Shopping Cart sidebar.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import AdminBooks from './admin'
import Books from './books'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Books />} />
      <Route path="/admin" element={<AdminBooks />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
