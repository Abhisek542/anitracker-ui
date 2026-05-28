export interface Anime {
  malId: number;
  title: string;
  score: number;
  type: string;
  imageUrl: string;
}

export interface AnimeDetail {
  malId: number;
  title: string;
  imageUrl: string;
  score: number;
  episodes: number;
  type: string;
  synopsis: string;
  genres: string[];
  trailerUrl: string;
}

export interface ComparisonResult {
  left: AnimeDetail;
  right: AnimeDetail;
}
