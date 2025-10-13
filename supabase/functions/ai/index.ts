// supabase/functions/ai/index.ts

import { Hono } from 'jsr:@hono/hono'
import { cors } from 'jsr:@hono/hono/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("AI Chat function loaded!")

const functionName = 'ai'
const app = new Hono().basePath(`/${functionName}`)

app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://seen-it-aymo.vercel.app'], 
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
}))

app.use('/*', async (c, next) => {
  console.log('Incoming request:', {
    method: c.req.method,
    path: c.req.path,
    headers: Object.fromEntries(c.req.raw.headers.entries())
  });
  await next();
});

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

app.post('/chat', async (c) => {
  try {
    const { message, userId } = await c.req.json()
    console.log('Received request:', { message: message?.substring(0, 50), userId })

    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }

    console.log('Environment check:', {
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      supabaseKey: Deno.env.get('SUPABASE_ANON_KEY') ? 'Set' : 'Not set',
      nextPublicUrl: Deno.env.get('NEXT_PUBLIC_SUPABASE_URL'),
      nextPublicKey: Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ? 'Set' : 'Not set',
      geminiKey: Deno.env.get('GEMINI_API_KEY') ? 'Set' : 'Not set',
      tmdbKey: Deno.env.get('TMDB_API_KEY') ? 'Set' : 'Not set'
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
                       Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') || 
                       'http://127.0.0.1:54321'
    
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 
                       Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') || ''

    if (!supabaseKey) {
      throw new Error('Supabase anon key is required. Check your environment variables.')
    }

    console.log('Using Supabase URL:', supabaseUrl)
    const supabase = createClient(supabaseUrl, supabaseKey)

    let userContext = {}
    
    if (userId) {
      console.log('Fetching user data...')
      
      try {
        const { data: interests } = await supabase
          .from('user_interests')
          .select('genre_id')
          .eq('user_id', userId)

        const { data: likes } = await supabase
          .from('user_movie_interactions')
          .select('movie_id')
          .eq('user_id', userId)
          .eq('action', 'favorited')
          .limit(5)

        const { data: watched } = await supabase
          .from('user_movie_interactions')
          .select('movie_id')
          .eq('user_id', userId)
          .eq('action', 'watched')
          .limit(5)

        const { data: searches } = await supabase
          .from('user_searches')
          .select('query')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        userContext = {
          interests: interests?.map((i: any) => i.genre_id) || [],
          likedMovies: likes?.map((l: any) => l.movie_id) || [],
          watchedMovies: watched?.map((w: any) => w.movie_id) || [],
          recentSearches: searches?.map((s: any) => s.query) || []
        }

        console.log('User context built:', userContext)
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    const tmdbKey = Deno.env.get('TMDB_API_KEY')
    let movieContext = {}
    
    if (tmdbKey) {
      try {
        const trendingResponse = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbKey}`
        )
        const trending = await trendingResponse.json()

        const popularResponse = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbKey}`
        )
        const popular = await popularResponse.json()

        movieContext = {
          trending: trending.results?.slice(0, 5).map((movie: any) => ({
            title: movie.title,
            overview: movie.overview?.substring(0, 100),
            genre_ids: movie.genre_ids,
            vote_average: movie.vote_average
          })) || [],
          popular: popular.results?.slice(0, 5).map((movie: any) => ({
            title: movie.title,
            overview: movie.overview?.substring(0, 100),
            genre_ids: movie.genre_ids,
            vote_average: movie.vote_average
          })) || []
        }

        console.log('Movie context built')
      } catch (error) {
        console.error('Error fetching movie data:', error)
      }
    }

    const aiPrompt = `You are SceneIt AI, a movie recommendation assistant.

User question: ${message}

${Object.keys(userContext).length > 0 ? `User preferences: ${JSON.stringify(userContext)}` : ''}

${movieContext && Object.keys(movieContext).length > 0 ? `Current trending movies: ${JSON.stringify(movieContext.trending?.slice(0, 3) || [])}` : ''}

Respond conversationally with helpful movie recommendations. Keep response under 200 words.`

    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: aiPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            topP: 0.8,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error('Failed to get AI response')
    }

    const aiData = await geminiResponse.json()
    
    console.log('Full Gemini response:', JSON.stringify(aiData, null, 2))
    
    let aiMessage = "I'm sorry, I couldn't generate a response right now."
    
    if (aiData.candidates && aiData.candidates.length > 0) {
      const candidate = aiData.candidates[0]
      
      if (candidate.content) {
        if (candidate.content.parts && candidate.content.parts.length > 0) {
          const text = candidate.content.parts[0].text
          if (text && text.trim()) {
            aiMessage = text.trim()
          }
        }
        else if (candidate.content.text) {
          aiMessage = candidate.content.text.trim()
        }
        else if (typeof candidate.content === 'string') {
          aiMessage = candidate.content.trim()
        }
      }
      else if (candidate.text) {
        aiMessage = candidate.text.trim()
      }
      if (candidate.finishReason) {
        console.log('Finish reason:', candidate.finishReason)
        if (candidate.finishReason === 'MAX_TOKENS') {
          console.log('Response was truncated due to token limit')
        }
      }
    }

    console.log('Extracted AI message:', aiMessage)

    return c.json({ response: aiMessage })

  } catch (error: any) {
    console.error('Function error:', error)
    
    return c.json({ 
      error: 'Internal server error',
      details: error.message 
    }, 500)
  }
})

app.notFound((c) => c.json({ error: 'Not found' }, 404))

app.onError((err, c) => {
  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)