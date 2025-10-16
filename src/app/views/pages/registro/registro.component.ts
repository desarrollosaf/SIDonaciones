import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { RegistroService } from '../../../service/registro.service';
import { FeplemService } from '../../../service/feplem.service';
import { UserService } from '../../../core/services/user.service';



@Component({
  selector: 'app-registro',
  imports: [NgxDatatableModule, CommonModule, RouterModule, FormsModule,
    ReactiveFormsModule, NgbTooltipModule, FullCalendarModule,],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  @ViewChild('table') table: DatatableComponent;
  @ViewChild('fullcalendar') calendarComponent: FullCalendarComponent;
  @ViewChild('xlModal', { static: true }) xlModal!: TemplateRef<any>;

  formModal: FormGroup;
  showModal = false;
  selectedDate: Date | null = null;
  fechaFormat: any;
  fechaModal: any;
  selectedHour: string = '';

  mensajeDisponibilidad: string = '';
  numeroLugares: number = 0;
  currentUser: any;
  banderaCita: number = 0;
  fechaHoraActual: string = '';
  fechaCitaEnvio: string = '';
  fechaFormateadaM: string = '';
  personaSeleccionada: any = null;
  datosCita: any = null;
  modalRef: NgbModalRef;
  viewState: 'lista' | 'enviar-link' | 'atender' = 'lista';
  mostrarCalendario = false;
  highlightedDates: string[] = ['2025-11-04', '2025-11-05'];
  horarios: {
    horario_id: number;
    horario_texto: string;
    sedes: { sede_id: number; sede_texto: string }[];
  }[] = [];

  correoUsuario: string = '';
  correoConfirmado: string = '';
  telefonoUsuario: string = '';
  telefonoConfirmado: string = '';
  donativo:  number | null = null;
  enviandoRegistro: number | null = null;


  public _registroService = inject(RegistroService);
  public _feplemService = inject(FeplemService)

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router, private _userService: UserService) {
    this.formModal = this.fb.group({
      textLink: [''],
      descripcion: ['']
    });
  }



  ngOnInit(): void {
    this.currentUser = this._userService.currentUserValue;
    /*this._registroService.getcitaRFC(this.currentUser.rfc).subscribe({
      next: (response: any) => {
        this.datosCita = response
        // console.log(this.datosCita);
        if (response.citas.length > 0) {
          this.mostrarCalendario = true;
        }
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
          if (this.modalRef) {
            this.modalRef.close('');
          }
        } else {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      }
    });*/
  }

  
  


  guardarSeleccion() {
    this.currentUser = this._userService.currentUserValue;
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoRegex.test(this.correoUsuario)) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: '¡Error!',
        text: 'El correo electrónico no es válido.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(this.telefonoUsuario)) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: '¡Error!',
        text: 'El teléfono debe contener exactamente 10 dígitos.',
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    if (this.correoUsuario !== this.correoConfirmado) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: "¡Error!",
        text: "Los correos no coinciden.",
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }

    if (this.telefonoUsuario !== this.telefonoConfirmado) {
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: "¡Error!",
        text: "Los teléfonos no coinciden.",
        showConfirmButton: false,
        timer: 5000
      });
      return;
    }


    const datos = {
      rfc: this.currentUser.rfc,
      correo: this.correoUsuario,
      telefono: this.telefonoUsuario,
      donativo: this.donativo
    };

    this.enviandoRegistro = 1;

    this._registroService.saveRegistro(datos).subscribe({
      next: (response: any) => {
        this.enviandoRegistro = null;
        if (response.status == 200) {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: "¡Cita registrada!",
            text: "Antes de acudir, descarga e imprime tu comprobante de cita.",
            showConfirmButton: false,
            timer: 5000
          });

          const firma = {
            user_rfc: 'PLEM62',
            path: response.donativo.path,
            docI: response.donativo.folio,
            firma_status: '1',
            status_doc: '1',
            tipo: '1',
            firma: '1',
            contra: 'PLEM62',
          };
          this._feplemService.firma(firma).subscribe({
            next: (response: any) => {
             console.log(response)
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
                if (this.modalRef) {
                  this.modalRef.close('');
                }
              } else {
                const msg = e.error?.msg || 'Error desconocido';
                console.error('Error del servidor:', msg);
              }
            }
          });
          
        }

      },
      error: (e: HttpErrorResponse) => {
        this.enviandoRegistro = null;
        if (e.status == 400) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Atención!",
            text: "Ya tienes una cita activa",
            showConfirmButton: false,
            timer: 5000
          });
          if (this.modalRef) {
            this.modalRef.close('');
          }
        } else {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      }
    });

  }


  /*descargarpdf() {
    this._registroService.generarPdfinal(this.currentUser.rfc).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'acuseCita' + this.currentUser.rfc + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar el PDF', error);
      }
    });

  }*/

  limpiaf() {
    ['textLink', 'descripcion'
    ].forEach(campo => {
      const control = this.formModal.get(campo);
      control?.setValue(null);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
    this.formModal.patchValue({
      textLink: '',
      descripcion: ''
    });
  }

}

