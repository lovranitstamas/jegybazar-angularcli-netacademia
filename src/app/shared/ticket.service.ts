import {Injectable} from '@angular/core';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/zip';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/combineLatest';
import {Observable} from 'rxjs/Observable';
import {EventModel} from './event-model';
import {EventService} from '../event/event.service';
import {TicketModel} from './ticket-model';
import {UserModel} from './user-model';
import {UserService} from './user.service';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/first';
import {AngularFireDatabase} from 'angularfire2/database';
import 'rxjs/add/operator/do';

@Injectable()
export class TicketService {

  constructor(
    private _eventService: EventService,
    private _userService: UserService,
    private afDb: AngularFireDatabase
  ) {
  }

  // Mi is tortenik itt, mert izi :) - logikai lepesekkel, hogy hogyan epulunk fel
  // 1. lepesben lekerjuk http.get-el az osszes ticketet, amik objectben erkeznek meg
  //    {key1: ticketObject1, key2: TicketObject2, key3: ticketObject3, ...}
  // 2. lepesben ezt atalakitjuk tombbe Object.values() segitsegevel
  //    [ticketObject1, ticketObject2, ticketObject3, ...]
  // 3. lepesben vegigmegyunk minden ticketObjectX-en es az Observable.zip() segitsegevel minden ticketObjectX-t atalakitunk
  //    3.a) krealunk 3 streamet: ticketObjectX-nek, illetve Eventnek es Usernek a ticketObjectX-ben tarolt id-k alapjan
  //      ticketObjectX-nek azert kell observable-t generalni, hogy alkalmazni tudjuk ra is a .zip()-et
  //    3.b) miutan a 2 uj streamunk is visszatert ertekkel egybefuzzuk az utolso parameterkent megadott fat arrow function-el
  //    3.c) es csinalunk belole egy uj streamet, amiben 1 ertek van, es ez az osszefuzott verzio
  //         ezen a ponton van egy [zipStream1, zipStream2, zipStream3, ...]
  // 4. osszeallitjuk a vegso streamunket
  //    4.a) Observable.forkJoin segitsegevel az osszes tombben kapott streamunk utolso elemet osszefuzzuk 1 tombbe
  //         es a keletkezett uj streamen ezt az 1 elemet emitteljuk
  //    4.b) mivel minket csak az osszefuzott ertek erdekel a streamen ezert a switchmap-el erre valtunk
  // ----------
  // Gondolatkiserlet: itt azert erdemes megnezni a devtoolbar network tabjat XHR szuresben,
  //                   es vegiggondolni, hogy hogy lehetne spórolni ezekkel a keresekkel!
  // -----
  // puffancs uzeni: "elkepzelheto", hogy egyszerubb megoldas is van, de szerintem ez szep
  //                 es mar nagyon vagytam valami agyzsibbasztora a projektben :)
  getAllTickets() {
    return this.afDb.list('tickets')
      .map(ticketsArray => ticketsArray.map(ticket =>
        Observable.zip(
          Observable.of(new TicketModel(ticket)),
          this._eventService.getEventById(ticket.eventId),
          this._userService.getUserById(ticket.sellerUserId),
          (t: TicketModel, e: EventModel, u: UserModel) => {
            return {
              ...t,
              event: e,
              seller: u
            };
          })
      ))
      .switchMap(zipStreamArray => Observable.forkJoin(zipStreamArray))
      ;
  }

  create(ticket: TicketModel) {
    ticket.bidCounter = 0;
    ticket.currentBid = 0;
    return Observable.fromPromise(this.afDb.list('tickets').push(ticket))
      .map(resp => resp.key)
      .do(
        ticketId => Observable.combineLatest(
          this._saveGeneratedId(ticket, ticketId),
          this._eventService.addTicket(ticket.eventId, ticketId),
          this._userService.addTicket(ticketId)
        )
      );
  }

  getOneOnce(id: string): Observable<TicketModel> {
    return this.getOne(id).first();
  }

  getOne(id: string): Observable<TicketModel> {
    return this.afDb.object(`tickets/${id}`)
      .flatMap(
        ticketFirebaseRemoteModel => {
          return Observable.combineLatest(
            Observable.of(new TicketModel(ticketFirebaseRemoteModel)),
            this._eventService.getEventById(ticketFirebaseRemoteModel.eventId),
            this._userService.getUserById(ticketFirebaseRemoteModel.sellerUserId),
            (t: TicketModel, e: EventModel, u: UserModel) => {
              return t.setEvent(e).setSeller(u);
            });
        }
      );
  }

  modify(ticket: TicketModel) {
    return Observable.fromPromise(this.afDb.object(`tickets/${ticket.id}`).update(ticket));
  }

  private _saveGeneratedId(ticket: TicketModel, ticketId: string) {
    return Observable.fromPromise(
      this.afDb.object(`tickets/${ticketId}`).set({...ticket, id: ticketId})
    );
  }

}
