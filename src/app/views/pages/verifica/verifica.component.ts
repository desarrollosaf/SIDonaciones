import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RegistroService } from '../../../service/registro.service';
import { UserService } from '../../../core/services/user.service';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-verifica',
  imports: [],
  templateUrl: './verifica.component.html',
  styleUrl: './verifica.component.scss'
})
export class VerificaComponent implements OnInit {
  public _registroService = inject(RegistroService);
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private _userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const data = {
      folio : token
    }
    //this.currentUser = this._userService.currentUserValue;
    
    this._registroService.validate(data).subscribe({
      next: (response: any) => {
 
        if(response.status == 200){
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: "¡Exito!",
            text: "Registro validado exitosamente, puedes descargar tu recibo.",
            showConfirmButton: false,
            timer: 5000
          });

          setTimeout(() => {
            this.router.navigate(['/donacion']); 
          }, 3000);

        }else if(response.status == 404){
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Error!",
            text: "Registro no encontrado.",
            showConfirmButton: false,
            timer: 5000
          });

        }else{

          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Error!",
            text: "Error, consulte al administrador.",
            showConfirmButton: false,
            timer: 5000
          });

        }
        

      },
      error: (e: HttpErrorResponse) => {
        if (e.status == 400) {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: "¡Error!",
            text: "Error, consulte al administrador",
            showConfirmButton: false,
            timer: 5000
          });
          
        } else {
          const msg = e.error?.msg || 'Error desconocido';
          console.error('Error del servidor:', msg);
        }
      }
    });

  }
}
