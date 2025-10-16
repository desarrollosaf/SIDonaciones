import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms'
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { RegistroService } from '../../../service/registro.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-donaciones',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './donaciones.component.html',
  styleUrl: './donaciones.component.scss'
})
export class DonacionesComponent {
  mostrarForm = false;
  registroForm: FormGroup;
  nombreCompleto: any;
  currentUser: any;
  public _registroService = inject(RegistroService);
  isSubmitting = false;


  constructor(private fb: FormBuilder, private _userService: UserService) {

    this.registroForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      confirmarCorreo: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      confirmarTelefono: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.max(50000)]],
    }, { validators: [this.matchFields('correo', 'confirmarCorreo'), this.matchFields('telefono', 'confirmarTelefono')] });

  }


  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    this.nombreCompleto = this.currentUser.nombre.Nombre;





  }

  matchFields(field1: string, field2: string): ValidatorFn {
    return (group: AbstractControl) => {
      const f1 = group.get(field1)?.value;
      const f2 = group.get(field2)?.value;

      if (f1 && f2 && f1 !== f2) {
        if (field1 === 'correo' && field2 === 'confirmarCorreo') {
          return { correoNoCoincide: true };
        }
        if (field1 === 'telefono' && field2 === 'confirmarTelefono') {
          return { telefonoNoCoincide: true };
        }
      }
      return null;
    };

  }


  enviardatos() {
    const datos = {
      correo: this.registroForm.value.correo,
      rfc: this.currentUser.rfc,
      telefono: this.registroForm.value.telefono,
      donativo: this.registroForm.value.cantidad
    };
    this.isSubmitting = true;

    this._registroService.saveRegistro(datos).subscribe({
      next: (response: any) => {
        console.log(response);
        console.log('Formulario enviado:');
        setTimeout(() => {
          this.isSubmitting = false;
          this.registroForm.reset();
          this.mostrarForm = true;
        }, 3000);
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.isSubmitting = false;
      }
    });


  }

}


