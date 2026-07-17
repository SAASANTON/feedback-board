'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Post = {
  id: string
  title: string
  description: string | null
  status: string
  votes: number
}

const ADMIN_PASSWORD = 'changeme123'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [posts, setPosts] = useState<Post[]>([])

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('votes', { ascending: false })

    if (!error) setPosts(data as Post[])
  }

  useEffect(() => {
    if (authed) loadPosts()
  }, [authed])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true)
    } else {
      alert('Wrong password')
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', id)

    if (!error) loadPosts()
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post permanently?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (!error) loadPosts()
  }

  if (!authed) {
    return (
      <main className="max-w-sm mx-auto px-4 py-20">
        <form onSubmit={handleLogin} className="space-y-3">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full">
            Log in
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Admin — Manage Posts</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="border rounded p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-semibold">{post.title}</h2>
                <p className="text-gray-500 text-sm">{post.votes} votes</p>
              </div>
              <button
                onClick={() => deletePost(post.id)}
                className="text-red-500 text-sm"
              >
                Delete
              </button>
            </div>
            <div className="flex gap-2">
              {['open', 'planned', 'in progress', 'done'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(post.id, s)}
                  className={`text-xs px-2 py-1 rounded border ${
                    post.status === s ? 'bg-black text-white' : ''
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}