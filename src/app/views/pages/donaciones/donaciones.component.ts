import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
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
nombreCompleto:any;
 currentUser: any;
 public _registroService = inject(RegistroService);

  constructor(private fb: FormBuilder, private _userService: UserService) {
    this.registroForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      cantidad: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+$/),
          Validators.max(50000),
        ],
      ],
    });
  }


  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    this.nombreCompleto = this.currentUser.nombre.Nombre;
    console.log(this.currentUser.nombre );
  }


 enviardatos() {
    // if (this.registroForm.invalid) {
    //   this.registroForm.markAllAsTouched();
    //   return;
    // }
console.log(this.registroForm.value.correo);
  const datos = {
      correo: this.registroForm.value.correo,
      rfc: this.currentUser.rfc,
      telefono: this.registroForm.value.telefono,
      donativo: this.registroForm.value.cantidad
    };
    console.log(datos);
   this._registroService.saveRegistro(datos).subscribe({
      next: (response: any) => {
        console.log(response);
        console.log('Formulario enviado:');
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });

    
  }

}
