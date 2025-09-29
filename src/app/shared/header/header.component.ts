import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <header class="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div class="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div class="flex items-center justify-between py-3 sm:py-4">
          <a class="flex items-center gap-3 min-w-0" href="/" aria-label="Página inicial - Sulwork Café">
            <img
              src="/sulwork-cafe-logo.png"
              srcset="/sulwork-cafe-logo.png 1x, /sulwork-cafe-logo.png 2x"
              alt="Logo Sulwork Café"
              width="56" height="56"
              loading="eager"
              class="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 object-contain select-none"
            />
            <div class="min-w-0">
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-800">
                Sulwork Café
              </h1>
              <p class="hidden xs:block text-xs sm:text-sm text-gray-600 truncate">
                Organize seus cafés da manhã colaborativos
              </p>
            </div>
          </a>

          <!-- Ações (opcional) -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- exemplo de botão de ação futuro
            <button type="button"
                    class="hidden sm:inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
              <lucide-icon name="coffee" class="w-4 h-4 mr-2"></lucide-icon>
              Novo café
            </button>
            -->
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {}