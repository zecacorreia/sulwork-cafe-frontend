import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { LucideAngularModule, Coffee, Edit3, UserPlus, Plus, X, Clock, Calendar, CheckCircle, XCircle, Trash2, User,LockKeyhole } from 'lucide-angular';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    importProvidersFrom(LucideAngularModule.pick({ Coffee, Edit3, UserPlus, Plus, X, Clock, Calendar, CheckCircle, XCircle, Trash2, User, LockKeyhole }))
  ]
};