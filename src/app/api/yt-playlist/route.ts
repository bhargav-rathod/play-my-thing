// app/api/yt-playlist/route.ts
import { NextResponse } from 'next/server';

const YT_API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const playlistId = searchParams.get('playlistId');

  if (!playlistId || !YT_API_KEY) {
    return NextResponse.json({ error: 'Missing playlistId or API key' }, { status: 400 });
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YT_API_KEY}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const items = data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}
