import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser'; 
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should set the page title on initialization', () => {
    const titleService = TestBed.inject(Title);
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges(); 
    const pageTitle = titleService.getTitle();
    expect(pageTitle).toBe('Sulwork Café | Organize seu café da manhã');
  });
});