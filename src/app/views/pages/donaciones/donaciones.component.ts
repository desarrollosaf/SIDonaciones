import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms'
import { UserService } from '../../../core/services/user.service';
import { RouterModule } from '@angular/router';
import { RegistroService } from '../../../service/registro.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FeplemService } from '../../../service/feplem.service';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
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
  public _feplemService = inject(FeplemService)
  isSubmitting = false;
  datosDona: any = null;
  isLoading = true;
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;

  modalRef: NgbModalRef;
  aceptaPrivacidad: boolean = false;
  constructor(private fb: FormBuilder, private _userService: UserService, private modalService: NgbModal) {

    this.registroForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      confirmarCorreo: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      confirmarTelefono: ['', [Validators.required]],
      cantidad: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.max(500000)]],
    }, { validators: [this.matchFields('correo', 'confirmarCorreo'), this.matchFields('telefono', 'confirmarTelefono')] });

  }
  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    this.nombreCompleto = this.currentUser.nombre.Nombre;
    this.getDonacion();
  }

  abrirModal() {
    this.modalRef = this.modalService.open(this.xlModal, { size: 'lg' });
    this.modalRef.result
      .then((result) => {
        // Aquí puedes manejar el cierre si es necesario
      })
      .catch((res) => {
        // Aquí puedes manejar el cierre con ESC o fuera del modal
      });
  }

  aceptarPrivacidad() {
    this.aceptaPrivacidad = true;
    this.modalRef.close();
  }


  getDonacion() {
    this._registroService.getRegistro(this.currentUser.rfc).subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          if (response.length === 0) {
            this.mostrarForm = false;
          } else {
            this.mostrarForm = true;
            this.datosDona = response;
          }
        } else if (response) {
          this.mostrarForm = true;
          this.datosDona = response;
        } else {
          this.mostrarForm = false;
        }
        this.isLoading = false;
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.isLoading = false;
      }
    });
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
        const firma = {
          user_rfc: 'PLEM62',
          path: response.path,
          docI: response.donativo.folio,
          firma_status: '1',
          status_doc: '1',
          tipo: '1',
          firma: '1',
          contra: 'PLEM62',
        };
        console.log(firma)
        const correo = this.registroForm.value.correo;

        Swal.fire({
          icon: 'info',
          title: 'Registro enviado',
          html: `Hemos enviado un token de seguridad a tu correo electrónico: <strong>${correo}</strong> para confirmar la donación.<br><br>Revisa tu bandeja de entrada y sigue las instrucciones.`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#96134b',
        });
        setTimeout(() => {
          this.isSubmitting = false;
          this.registroForm.reset();
          this.getDonacion();
          this.mostrarForm = true;
        }, 2000);

        this._feplemService.firma(firma).subscribe({
          next: (response: any) => {
          },
          error: (e: HttpErrorResponse) => {
            if (e.status == 400) {
              Swal.fire({
                position: 'center',
                icon: 'error',
                title: "¡Atención!",
                text: "Ya tienes una cita activa",
                showConfirmButton: false,
                timer: 5000
              });

            } else {
              const msg = e.error?.msg || 'Error desconocido';
              console.error('Error del servidor:', msg);
            }
          }
        });
      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
        this.isSubmitting = false;
      }
    });


  }

}


