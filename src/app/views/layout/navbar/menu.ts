import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
  {
    label: 'Registro',
    icon: 'home',
    link: '/donacion',
    roles: ['usuario'],
  },
  {
    label: 'Reportes',
    icon: 'mail',
    roles: ['JS'],
    subMenus: [
      {
        subMenuItems: [
          {
            label: 'Administrador',
            isTitle: true,
          },
          {
            label: 'Citas',
            link: '/reportes'
          },
          {
            label: 'Servidores publicos',
            link: '/reportes/servidores-publicos'
          },
        ]
      },
    ]
  },
  
  
];
