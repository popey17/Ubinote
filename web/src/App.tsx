import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { NoteEditorPage } from './pages/NoteEditorPage'
import { NotesListPage } from './pages/NotesListPage'
import { NoteViewPage } from './pages/NoteViewPage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<NotesListPage />} />
          <Route path="/notes/new" element={<NoteEditorPage mode="create" />} />
          <Route path="/notes/:id" element={<NoteViewPage />} />
          <Route
            path="/notes/:id/edit"
            element={<NoteEditorPage mode="edit" />}
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
