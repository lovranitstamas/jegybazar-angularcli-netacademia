import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {UserModel} from '../../shared/user-model';
import {UserService} from '../../shared/user.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css']
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  user: UserModel;
  registerMode = false;

  private _destroy$ = new Subject();

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {
  }

  ngOnInit() {
    this._userService.getCurrentUser().subscribe(
      user => {
        this.user = user;
        if (user == null) {
          this.registerMode = true;
          this.user = new UserModel();
        }
      }
    );
  }

  // ezt a mintat kifejtettem az event-eknel
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }


  // mivel a regisztracio opcionalisan el a formon,
  // ezert alap viselkedesnek bekotottuk az save-t
  // ami a submit tipusu gomb megnyomasara hivodik meg ngSubmit-en keresztul
  updateUser() {
    this._userService.save(this.user);
    this._goToProfile();
  }

  // ha regisztracios esetben vagyunk akkor viszont __NEM__ hasznalunk submit buttont
  // hanem sima type="button"-t es (click)-re hivjuk meg a create-t
  createUser(pass: string) {
    this._userService.register(this.user, pass)
      .subscribe(
        data => this._goToProfile(),
        err => console.warn('registracio kozben problemank adodott: ', err)
      );
  }

  private _goToProfile() {
    this._router.navigate(['/user']);
  }

}
