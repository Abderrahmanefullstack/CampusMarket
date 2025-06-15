import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MessageService } from './services/message.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Campus Market</a>
        
        <!-- Indicateur de messages non lus -->
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" (click)="goToMessages()" style="cursor: pointer;">
              Messages 
              <span *ngIf="unreadCount > 0" class="badge bg-danger rounded-pill">
                {{ unreadCount }}
              </span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Campus Market';
  unreadCount: number = 0;
  private unreadSubscription!: Subscription;

  constructor(private messageService: MessageService, private router: Router) { }

  ngOnInit() {
    this.unreadSubscription = this.messageService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy() {
    if (this.unreadSubscription) {
      this.unreadSubscription.unsubscribe();
    }
  }

  goToMessages() {
    this.router.navigate(['/messages']);
  }
}
