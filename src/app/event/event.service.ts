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
  }

  getEventById(id: string) {
    return this.afDb.object(`events/${id}`);
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
  }

  // TODO: itt kitalalni, hogy hogyan akarjuk kezelni a fuggosegeket es aszerint implementalni
  delete(event: EventModel) {
    return Observable.fromPromise(this.afDb.object(`events/${event.id}`).remove());
  }

  addTicket(eventId: string, ticketId: string): Observable<string> {
    return Observable.fromPromise(this.afDb.list(`events/${eventId}/tickets`).push({[ticketId]: true}));
  }
}

