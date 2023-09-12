import { Injectable } from '@angular/core';
import {AbstractControl} from "@angular/forms";
import {delay, Observable, of, switchMap} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmailValidationService {

  constructor() { }
  checkEmail(control: AbstractControl): Observable<boolean> {
    const email = control.value;

    return of(null).pipe(
      delay(2000),
      switchMap(() => {
        return email==='test@test.test'?of(true):of(false);
      })
    );
  }
}
