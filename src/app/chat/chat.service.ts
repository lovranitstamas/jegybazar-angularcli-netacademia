import {Injectable, Optional} from '@angular/core';
import {UserService} from '../shared/user.service';
import {Observable} from 'rxjs/Observable';
import {ChatMessageModel} from './model/chat.model';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireList} from 'angularfire2/database/es2015';
import 'rxjs/add/operator/switchMap';
import * as moment from 'moment';
import 'rxjs/add/operator/map';

@Injectable()
export class ChatService {
  private static PATH = 'chat/ticket_room';
  messageList: AngularFireList<any>;

  constructor(
    protected userService: UserService,
    @Optional() protected afDb?: AngularFireDatabase
  ) {
  }

  addMessage(roomId: string, msg: string): Observable<boolean> {
    return this.userService.getCurrentUser()
      .switchMap(
        user => {
          return new Observable<boolean>(
            observer => {
              const room = this.afDb.list(`${ChatService.PATH}/${roomId}`);
              room.push(
                new ChatMessageModel({
                  $id: null,
                  'msg': msg,
                  userId: user.id,
                  userName: user.name,
                  userPictureUrl: user.profilePictureUrl,
                  created: moment().unix()
                })
              ).then(
                () => {
                  observer.next(true);
                  observer.complete();
                },
                error => {
                  observer.next(false);
                  observer.error(error);
                  observer.complete();
                }
              );
            }
          );
        }
      );
  }

  getRoomMessages(roomId: string): Observable<ChatMessageModel[]> {
    this.messageList = this.afDb.list(`${ChatService.PATH}/${roomId}`);

    return this.messageList
      .map(
        (list) =>
          list.map(
            chatMessage => {
              return new ChatMessageModel(Object.assign(chatMessage, {$id: chatMessage.$key}));
            }
          )
      );
  }
}
