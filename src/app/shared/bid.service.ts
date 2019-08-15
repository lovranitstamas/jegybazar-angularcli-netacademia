import {Injectable} from '@angular/core';
import {TicketService} from './ticket.service';
import 'rxjs/add/operator/mergeMap';
import {UserService} from './user.service';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class BidService {

  constructor(
    private ticketService: TicketService,
    private _userService: UserService,
    private afDb: AngularFireDatabase
  ) {
  }

  bid(ticketId: string, value: number) {
    return this._userService.getCurrentUser()
      .switchMap(
        user => {
          return Observable.fromPromise(this.afDb.object(`bids/${ticketId}/${user.id}`).set(value))
            .flatMap(
              () => {
                return this.ticketService.getOneOnce(ticketId);
              }
            )
            .flatMap(
              ticket => {
                return this.ticketService.modify(
                  Object.assign(ticket, {currentBid: value, bidCounter: ++ticket.bidCounter})
                );
              }
            );
        }
      );
  }
}
