// user-access.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';


@Injectable({
  providedIn: 'root'
})
export class UserAccessGuard implements CanActivate, CanActivateChild {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    
    const rfc = this.userService.currentUserValue?.rfc ?? '';
    const role = rfc.startsWith('VC') ? 'VC' : 'usuario';

    if (role == 'VC') {
      return true;
    }

    this.router.navigate(['/not-authorized']);
    return false;
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }
}
