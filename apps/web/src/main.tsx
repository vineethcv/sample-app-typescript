
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const qc = new QueryClient()
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

type Task = { id: number; title: string; done: boolean }

function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tasks`)
      if (!res.ok) throw new Error('Failed to load tasks')
      return res.json()
    }
  })
}

function Home() {
  const { data, isLoading, error } = useTasks()
  const queryClient = useQueryClient()
  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!res.ok) throw new Error('Failed to add task')
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
  })

  if (isLoading) return <p>Loading…</p>
  if (error) return <p>Error: {(error as Error).message}</p>

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <h1>Tasks</h1>
      <form onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget as HTMLFormElement)
        const title = String(fd.get('title') || '')
        if (title) addMutation.mutate(title)
        ;(e.currentTarget as HTMLFormElement).reset()
      }}>
        <input name="title" placeholder="New task…" />
        <button type="submit">Add</button>
      </form>
      <ul>
        {data?.map(t => <li key={t.id}>{t.title} {t.done ? '✅' : ''}</li>)}
      </ul>
      <p><Link to="/about">About</Link></p>
    </div>
  )
}

function About() { return <div style={{ padding: 24 }}><h1>About</h1><p>Minimal SPA hitting Nest API.</p></div> }

function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
