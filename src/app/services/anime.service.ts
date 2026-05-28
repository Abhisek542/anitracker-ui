import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Anime, AnimeDetail, ComparisonResult } from '../models/anime.model';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/anime';

  getTrending(): Observable<Anime[]> {
    return this.http.get<Anime[]>(`${this.baseUrl}/trending`);
  }

  search(query: string): Observable<Anime[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Anime[]>(`${this.baseUrl}/search`, { params });
  }

  getDetail(id: number): Observable<AnimeDetail> {
    return this.http.get<AnimeDetail>(`${this.baseUrl}/${id}`);
  }

  compare(id1: number, id2: number): Observable<ComparisonResult> {
    const params = new HttpParams().set('id1', id1).set('id2', id2);
    return this.http.get<ComparisonResult>(`${this.baseUrl}/compare`, { params });
  }
}
