import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private meta: Meta, private title: Title) {}

  ngOnInit() {
    const pageTitle = 'Sulwork Café | Organize seu café da manhã';
    const pageDescription = 'Uma aplicação para organizar os cafés da manhã colaborativos da sua equipe.';
    const imageUrl = 'https://sulwork-cafe-frontend-production.up.railway.app/assets/social-preview.jpg';
    const pageUrl = 'https://sulwork-cafe-frontend-production.up.railway.app';

    this.title.setTitle(pageTitle);
    
    this.meta.updateTag({ name: 'description', content: pageDescription });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: pageDescription });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: pageDescription });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
  }
}
