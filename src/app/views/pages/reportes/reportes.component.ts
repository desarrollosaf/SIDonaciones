import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CitasService } from '../../../service/citas.service';
import { FullCalendarComponent } from '@fullcalendar/angular';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { UserService } from '../../../core/services/user.service';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartData, ChartConfiguration } from 'chart.js';
import { ColumnMode, DatatableComponent, NgxDatatableModule } from '@siemens/ngx-datatable';
import { RegistroService } from '../../../service/registro.service';

@Component({
  selector: 'app-detalle-citas',
  imports: [NgxDatatableModule, CommonModule, RouterModule, FormsModule,
    ReactiveFormsModule, NgbTooltipModule, FullCalendarModule, NgbAccordionModule,],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  public _citasService = inject(CitasService);
  public _userService = inject(UserService);
  public _registroService = inject(RegistroService);
  fechaFormat: any;
  rfcUser: any;
  currentUser: any;
  fechaHoraActual: string = '';
  visibleHorarios: { [key: string]: boolean } = {};
  descargandoExcel: number | null = null;

  originalData: any[] = [];
  temp: any[] = [];
  rows: any[] = [];
  page: number = 0;
  pageSize: number = 10;
  filteredCount: number = 0;
  loading: boolean = true;
  @ViewChild('table') table: DatatableComponent;
  isLoading: boolean = false;
  tDon = 0;
  tLetra: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router) { }

  ngOnInit(): void {
    this.getDatos();
    this.actualizarFechaHora();
    setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }








  getDatos() {
    this._registroService.getAll().subscribe({
      next: (response: any) => {
        response.datos.forEach((cant: any) => {
          this.tDon = this.tDon + Number(cant.cantidad);
        });

        const total = this.tDon;
        const pesos = Math.floor(total); // 1350
        const centavos = Math.round((total - pesos) * 100); // 75
        this.tLetra = `${this.numeroALetras(pesos)} PESOS ${centavos.toString().padStart(2, '0')}/100 M.N.`;
        this.originalData = [...response.datos];
        this.temp = [...this.originalData];
        this.rows = this.temp;
        this.filteredCount = this.temp.length;
        this.loading = false;

      },
      error: (e: HttpErrorResponse) => {
        const msg = e.error?.msg || 'Error desconocido';
        console.error('Error del servidor:', msg);
      }
    });
  }



  numeroALetras(num: number): string {
    const unidades = ['CERO', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales: { [key: number]: string } = {
      11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
      10: 'DIEZ', 20: 'VEINTE'
    };

    const convertir = (n: number): string => {
      if (n < 10) return unidades[n];
      if (n <= 15) return especiales[n];
      if (n < 20) return 'DIECI' + unidades[n - 10].toLowerCase();
      if (n < 30) return 'VEINTI' + unidades[n - 20].toLowerCase();
      if (n < 100) {
        const dec = Math.floor(n / 10);
        const uni = n % 10;
        return decenas[dec - 1] + (uni ? ' Y ' + unidades[uni] : '');
      }
      if (n < 1000) {
        if (n === 100) return 'CIEN';
        const centenas = ['CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
        const cent = Math.floor(n / 100);
        const resto = n % 100;
        return centenas[cent - 1] + (resto ? ' ' + convertir(resto) : '');
      }
      if (n < 1000000) {
        const mil = Math.floor(n / 1000);
        const resto = n % 1000;
        let str = mil === 1 ? 'MIL' : convertir(mil) + ' MIL';
        if (resto) str += ' ' + convertir(resto);
        return str;
      }
      if (n < 1000000000000) {
        const millones = Math.floor(n / 1000000);
        const resto = n % 1000000;
        let str = millones === 1 ? 'UN MILLÓN' : convertir(millones) + ' MILLONES';
        if (resto) str += ' ' + convertir(resto);
        return str;
      }
      return 'Número demasiado grande';
    };

    return convertir(num);
  }

  setPage(pageInfo: any) {
    this.page = pageInfo.offset;
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.rows = this.temp.slice(start, end);
  }

  updateFilter(event: any) {
    const val = (event.target?.value || '').toLowerCase();
    this.temp = this.originalData.filter((row: any) => {
      const nombre = (row.nombre_completo || '').toLowerCase();
      const curp = (row.f_curp || '').toLowerCase();
      const rfc = (row.rfc || '').toLowerCase();

      return (
        nombre.includes(val) ||
        curp.includes(val) ||
        rfc.includes(val)
      );
    });
    this.filteredCount = this.temp.length;
    this.setPage({ offset: 0 });
  }
  actualizarFechaHora() {
    const ahora = new Date();
    this.fechaHoraActual = ahora.toLocaleString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  descargarExcel() {
    this.isLoading = true;
    this._registroService.getExcelD().subscribe({
      next: (response: Blob) => {
        const nombreArchivo = `reporte.xlsx`;
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_donaciones.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "success",
          title: "Se descargó correctamente."
        });
      },
      error: (e: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Error al descargar Excel:', e.error?.msg || e);
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Ocurrió un error al descargar el archivo.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }
}
