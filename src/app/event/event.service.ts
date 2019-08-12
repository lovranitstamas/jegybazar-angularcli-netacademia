import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import {Observable} from 'rxjs/Observable';
import {EventModel} from '../shared/event-model';
import {AngularFireDatabase} from 'angularfire2/database';
import 'rxjs/add/observable/fromPromise';
import {AngularFireList} from 'angularfire2/database/es2015';

@Injectable()
export class EventService {
  eventList: AngularFireList<any>;

  constructor(
    private afDb: AngularFireDatabase
  ) {
  }

  getAllEvents(): Observable<EventModel[]> {
    this.eventList = this.afDb.list('events/');

    return this.eventList
      .map(
        (events) =>
          events.map(
            event => {
              return new EventModel(Object.assign(event, {id: event.$key}));
            }
          )
      );
    /* return this._http.get(`${environment.firebase.baseUrl}/events.json`)
      .map(data => Object.values(data).map(evm => new EventModel(evm)));*/
  }

  getEventById(id: string) {
    return this.afDb.object(`events/${id}`);
    // return this._http.get<EventModel>(`${environment.firebase.baseUrl}/events/${id}.json`);
  }

  save(param: EventModel) {
    if (param.id) {
      return Observable.fromPromise(this.afDb.object(`events/${param.id}`).update(param));
    } else {
      return Observable.fromPromise(
        this.afDb.list(`events`).push(param)
      )
        .map((eventPostReturn: { key: string }) => {
          return eventPostReturn.key;
        })
        .switchMap(eventId => this.afDb.object(
          `events/${eventId}`).set({...param, id: eventId})
        );
    }
    /*console.log(param);
    if (param.id) { // udpate ag
      return this._http.put(`${environment.firebase.baseUrl}/events/${param.id}.json`, param);
    } else { // create ag
      return this._http.post(`${environment.firebase.baseUrl}/events.json`, param)
        .map((fbPostReturn: { name: string }) => fbPostReturn.name)
        .switchMap(fbId => this._http.patch(
          `${environment.firebase.baseUrl}/events/${fbId}.json`,
          {id: fbId}
        ));
    }*/
  }

  // TODO: itt kitalalni, hogy hogyan akarjuk kezelni a fuggosegeket es aszerint implementalni
  delete(event: EventModel) {
    return Observable.fromPromise(this.afDb.object(`events/${event.id}`).remove());
    // return this._http.delete(`${environment.firebase.baseUrl}/events/${param.id}.json`);
  }

  addTicket(eventId: string, ticketId: string): Observable<string> {
    return Observable.fromPromise(this.afDb.list(`events/${eventId}/tickets`).push({[ticketId]: true}));
    /*return this._http.patch(
      `${environment.firebase.baseUrl}/events/${eventId}/tickets.json`,
      {[ticketId]: true}
    )
      .map(rel => Object.keys(rel)[0]);*/
  }
}

