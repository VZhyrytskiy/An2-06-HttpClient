import { Component, type OnInit} from '@angular/core';
import { ActivatedRoute, Router, type UrlTree, type Data } from '@angular/router';
import { type Observable, map } from 'rxjs';

import { DialogService } from './../../../core';
import { UserModel } from './../../models/user.model';
import { UserArrayService } from './../../services/user-array.service';
import type { CanComponentDeactivate } from './../../../core';

@Component({
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, CanComponentDeactivate {
  user!: UserModel;
  originalUser!: UserModel;

  private onGoBackClick: boolean = false;

  constructor(
    private userArrayService: UserArrayService,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    // data is an observable object
    // which contains custom and resolve data
    this.route.data.pipe(map((data: Data) => data['user'])).subscribe((user: UserModel) => {
      this.user = { ...user };
      this.originalUser = { ...user };
    });
  }

  onSaveUser(): void {
    const user = { ...this.user };

    if (user.id) {
      this.userArrayService.updateUser(user);
      // optional parameter: http://localhost:4200/users;id=2
      this.router.navigate(['/users', { editedUserID: user.id }]);
    } else {
      this.userArrayService.createUser(user);
      this.onGoBack();
    }
    this.originalUser = { ...this.user };
  }

  onGoBack(): void {
    this.onGoBackClick = true;
    this.router.navigate(['./../../'], { relativeTo: this.route });
  }

  canDeactivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    if (this.onGoBackClick) return true;

    const flags = (Object.keys(this.originalUser) as (keyof UserModel)[]).map(key => {
      if (this.originalUser[key] === this.user[key]) {
        return true;
      }
      return false;
    });

    if (flags.every(el => el)) {
      return true;
    }

    // Otherwise ask the user with the dialog service and return its
    // promise which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }
}
