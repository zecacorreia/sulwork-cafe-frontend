import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="bg-white text-gray-700 border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center gap-4">
          <img 
            src="./assets/sulwork-cafe-logo.png" 
            alt="Logo" 
            class="h-16 w-16 object-contain md:h-20 md:w-20"
          >
          <div>
            <h1 class="text-2xl font-bold tracking-tight text-gray-700 md:text-3xl">
              Sulwork Café
            </h1>
            <p class="text-sm text-gray-600">
              Organize seus cafés da manhã colaborativos
            </p>
          </div>
        </div>
      </div>
    </header>
  `
})

export class HeaderComponent {}