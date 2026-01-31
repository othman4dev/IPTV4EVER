import { Injectable } from '@nestjs/common';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  streamUrl: string;
  epg?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

@Injectable()
export class IptvService {
  private channels: Channel[] = [
    {
      id: '1',
      name: 'CNN International',
      logo: 'https://i.imgur.com/ilZJT5s.png',
      category: 'news',
      streamUrl: 'https://example.com/stream/cnn',
      epg: 'https://example.com/epg/cnn.xml'
    },
    {
      id: '2',
      name: 'BBC World News',
      logo: 'https://i.imgur.com/REuN9RR.png',
      category: 'news',
      streamUrl: 'https://example.com/stream/bbc',
    },
    {
      id: '3',
      name: 'ESPN',
      logo: 'https://i.imgur.com/7CMJp5s.png',
      category: 'sports',
      streamUrl: 'https://example.com/stream/espn',
    },
    {
      id: '4',
      name: 'Discovery Channel',
      logo: 'https://i.imgur.com/5pN0nBt.png',
      category: 'documentary',
      streamUrl: 'https://example.com/stream/discovery',
    },
  ];

  private categories: Category[] = [
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'movies', name: 'Movies', icon: '🎬' },
    { id: 'documentary', name: 'Documentary', icon: '🎓' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎭' },
  ];

  getChannels() {
    return {
      success: true,
      data: this.channels,
      total: this.channels.length,
    };
  }

  getChannel(id: string) {
    const channel = this.channels.find(ch => ch.id === id);
    if (!channel) {
      return {
        success: false,
        message: 'Channel not found',
      };
    }
    return {
      success: true,
      data: channel,
    };
  }

  getCategories() {
    return {
      success: true,
      data: this.categories,
      total: this.categories.length,
    };
  }

  createPlaylist(playlistData: any) {
    return {
      success: true,
      message: 'Playlist created successfully',
      data: playlistData,
    };
  }
}
