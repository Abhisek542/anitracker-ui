import { Routes } from '@angular/router';
import { TrendingComponent } from './trending/trending.component';
import { FavoritesComponent } from './favorites/favorites.component';

export const routes: Routes = [
  { path: '', component: TrendingComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'compare', loadComponent: () => import('./compare/compare.component').then(m => m.CompareComponent) },
  { path: 'anime/:id', loadComponent: () => import('./anime-detail/anime-detail.component').then(m => m.AnimeDetailComponent) },
  { path: '**', redirectTo: '' }
];
