'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Post = {
  id: string
  title: string
  description: string | null
  status: string
  votes: number
  created_at: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('votes', { ascending: false })

    if (error) console.error(error)
    else setPosts(data as Post[])

    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const { error } = await supabase
      .from('posts')
      .insert({ title, description })

    if (error) {
      console.error(error)
      return
    }

    setTitle('')
    setDescription('')
    loadPosts()
  }

  async function handleUpvote(post: Post) {
    const { error } = await supabase
      .from('posts')
      .update({ votes: post.votes + 1 })
      .eq('id', post.id)

    if (error) {
      console.error(error)
      return
    }

    loadPosts()
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Feedback Board</h1>
      <p className="text-gray-500 mb-8">Suggest a feature or vote on existing ones.</p>

      <form onSubmit={handleSubmit} className="mb-10 space-y-3">
        <input
          type="text"
          placeholder="Feature title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          placeholder="Details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2"
          rows={3}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="border rounded p-4 flex justify-between items-start">
              <div>
                <h2 className="font-semibold">{post.title}</h2>
                {post.description && (
                  <p className="text-gray-500 text-sm mt-1">{post.description}</p>
                )}
                <span className="text-xs uppercase text-gray-400 mt-2 inline-block">
                  {post.status}
                </span>
              </div>
              <button
                onClick={() => handleUpvote(post)}
                className="border rounded px-3 py-1 font-medium hover:bg-gray-100"
              >
                ▲ {post.votes}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}