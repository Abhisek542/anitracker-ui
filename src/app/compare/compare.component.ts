import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule, DecimalPipe } from '@angular/common';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AnimeService } from '../services/anime.service';
import { Anime, AnimeDetail, ComparisonResult } from '../models/anime.model';

interface Slot {
  querySubject: Subject<string>;
  subscription: Subscription;
  query: ReturnType<typeof signal<string>>;
  results: ReturnType<typeof signal<Anime[]>>;
  isSearching: ReturnType<typeof signal<boolean>>;
  selected: ReturnType<typeof signal<AnimeDetail | null>>;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.css'
})
export class CompareComponent implements OnInit, OnDestroy {
  private readonly animeService = inject(AnimeService);

  left!: Slot;
  right!: Slot;

  comparison = signal<ComparisonResult | null>(null);
  isComparing = signal(false);
  compareError = signal<string | null>(null);
  sameAnimeWarning = signal(false);

  ngOnInit(): void {
    this.left = this.createSlot();
    this.right = this.createSlot();
  }

  private createSlot(): Slot {
    const querySubject = new Subject<string>();
    const query = signal('');
    const results = signal<Anime[]>([]);
    const isSearching = signal(false);
    const selected = signal<AnimeDetail | null>(null);

    const subscription = querySubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) return of<Anime[]>([]);
        isSearching.set(true);
        return this.animeService.search(q).pipe(catchError(() => of<Anime[]>([])));
      })
    ).subscribe(data => {
      results.set(data);
      isSearching.set(false);
    });

    return { querySubject, subscription, query, results, isSearching, selected };
  }

  onInput(slot: Slot, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    slot.query.set(value);
    if (!value.trim()) {
      slot.results.set([]);
      slot.isSearching.set(false);
    }
    slot.querySubject.next(value);
  }

  selectAnime(slot: Slot, anime: Anime): void {
    slot.isSearching.set(true);
    this.animeService.getDetail(anime.malId).subscribe({
      next: (detail) => {
        slot.selected.set(detail);
        slot.results.set([]);
        slot.query.set('');
        slot.isSearching.set(false);
        this.tryCompare();
      },
      error: () => {
        slot.isSearching.set(false);
      }
    });
  }

  clearSlot(slot: Slot): void {
    slot.selected.set(null);
    slot.results.set([]);
    slot.query.set('');
    this.comparison.set(null);
    this.compareError.set(null);
    this.sameAnimeWarning.set(false);
  }

  private tryCompare(): void {
    const l = this.left.selected();
    const r = this.right.selected();
    if (!l || !r) return;

    if (l.malId === r.malId) {
      this.sameAnimeWarning.set(true);
      this.comparison.set(null);
      return;
    }

    this.sameAnimeWarning.set(false);
    this.isComparing.set(true);
    this.compareError.set(null);

    this.animeService.compare(l.malId, r.malId).subscribe({
      next: (result) => {
        this.comparison.set(result);
        this.isComparing.set(false);
      },
      error: () => {
        this.compareError.set('Failed to load comparison. Please try again.');
        this.isComparing.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.left?.subscription.unsubscribe();
    this.right?.subscription.unsubscribe();
  }
}
