import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './core/page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { LoggedInGuardGuard } from './shared/logged-in-guard.guard';
import { BidComponent } from './ticket/bid/bid.component';
import { TicketDetailComponent } from './ticket/ticket-detail/ticket-detail.component';
import { TicketListComponent } from './ticket/ticket-list/ticket-list.component';
import { TicketComponent } from './ticket/ticket.component';
import { LoginComponent } from './user/login/login.component';
import { ProfileEditComponent } from './user/profile-edit/profile-edit.component';
import { ProfileComponent } from './user/profile/profile.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'event', loadChildren: 'app/event/event.module#EventModule' },
  {
    path: 'ticket',
    component: TicketComponent,
    children: [
      { path: '', component: TicketListComponent },
      { path: 'new', component: TicketDetailComponent, canActivate: [LoggedInGuardGuard] },
      { path: ':id', component: BidComponent },
    ]
  },
  { path: 'about', loadChildren: 'app/about/about.module#AboutModule' },
  {
    path: 'user',
    children: [
      { path: '', component: ProfileComponent, canActivate: [LoggedInGuardGuard] },
      { path: 'edit', component: ProfileEditComponent, canActivate: [LoggedInGuardGuard] },
      { path: 'login', component: LoginComponent },
      { path: 'registration', component: ProfileEditComponent }
    ]
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
  static routableComponents = [
    HomeComponent,
    TicketComponent,
    TicketListComponent,
    TicketDetailComponent,
    BidComponent,
    LoginComponent,
    ProfileComponent,
    ProfileEditComponent,
    PageNotFoundComponent
  ];
}

