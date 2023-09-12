import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EmailValidationService} from "../../services/email-validation.service";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  applicationForm: FormGroup;
  technologies: string[] = ['angular', 'react', 'vue'];
  duplicateRequestCheck: string;
  loaderEmail: boolean = false;
  countControlsHobbies: {id: number}[] = [
    {id: 1}
  ]
  versions: any = {
    angular: ['1.1.1', '1.2.1', '1.3.3'],
    react: ['2.1.2', '3.2.4', '4.3.1'],
    vue: ['3.3.1', '5.2.1', '5.1.3'],
  }

  constructor(
    private formBuilder: FormBuilder,
    private emailValidate: EmailValidationService
  ) {}

  ngOnInit(): void {
    this.applicationForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{value: '', disabled: false}, [Validators.required, Validators.email]],
      dateOfBirth: ['', Validators.required],
      framework: ['', Validators.required],
      frameworkVersion: ['', Validators.required],
      hobbies: this.formBuilder.group({
        ['hobby-1']: ['', Validators.required],
        ['duration-1']: ['', Validators.required],
      })
    });

  }

  onSubmit() {
    if (this.applicationForm.valid) {
      console.log(this.applicationForm.value.hobbies)
      this.applicationForm.value.dateOfBirth = this.changeDateFormat(this.applicationForm.value.dateOfBirth)
      this.applicationForm.value.hobbies = this.transformObjectToArray(this.applicationForm.value.hobbies)

      const jsonData = JSON.stringify(this.applicationForm.value);
      alert(jsonData)
      this.applicationForm.reset()
    }
  }

  onEmailInputFocus(): void {
    if (this.applicationForm.controls['email'].valid && this.duplicateRequestCheck !== this.applicationForm.controls['email'].value) {
      this.applicationForm.controls['email'].disable();
      this.loaderEmail = true
      this.emailValidate.checkEmail(this.applicationForm.controls['email']).subscribe({
        next: (res: boolean) => {
          this.applicationForm.controls['email'].enable();
          this.duplicateRequestCheck = this.applicationForm.controls['email'].value;
          res ? this.applicationForm.controls['email'].setErrors({checkEmailValidator: true}) : this.applicationForm.controls['email'].setErrors(null);
        },
        error: (error) => {
          console.log(error)
          this.applicationForm.controls['email'].enable();
          this.loaderEmail = false
          this.applicationForm.controls['email'].setErrors({serverError: true});
        },
        complete: () => {
          this.loaderEmail = false;
        }
      });

    }
  }

 private changeDateFormat(time: string) {
    const date = new Date(time);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  getErrorMessageEmail() {
    if (this.applicationForm.controls['email'].hasError('required')) {
      return 'write your email';
    }
    if (this.applicationForm.controls['email'].hasError('checkEmailValidator')) {
      return `The "${this.applicationForm.controls['email'].value}" this email already exists`;
    }
    if (this.applicationForm.controls['email'].hasError('serverError')) {
      return `some server error`;
    }
    return this.applicationForm.controls['email'].hasError('email') ? 'Not a valid email' : '';
  }

  addHobby(){
    const hobbiesControl = this.applicationForm.get('hobbies') as FormGroup;
    this.countControlsHobbies.push({id:this.countControlsHobbies[this.countControlsHobbies.length - 1].id+1})
    const lastId  = this.countControlsHobbies[this.countControlsHobbies.length - 1].id
    hobbiesControl.addControl(`hobby-${lastId}`, this.formBuilder.control('', Validators.required));
    hobbiesControl.addControl(`duration-${lastId}`, this.formBuilder.control('', Validators.required));
  }

  deleteHobby(id:number){
    const hobbiesGroup = this.applicationForm.get('hobbies') as FormGroup;
    hobbiesGroup.removeControl('hobby-'+id);
    hobbiesGroup.removeControl('duration-'+id);
    this.countControlsHobbies = this.countControlsHobbies.filter(control => control.id !== id);

  }

  private transformObjectToArray(obj: any) {
    const arr = [];

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key.startsWith('hobby-')) {
          const index = key.split('-')[1];
          const durationKey = `duration-${index}`;

          if (obj.hasOwnProperty(durationKey)) {
            arr.push({ name: obj[key], duration: obj[durationKey] });
          }
        }
      }
    }

    return arr;

  }


}
