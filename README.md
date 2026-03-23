# Sistema de Reservaciones - Práctica 6

- **[`prisma/schema.prisma`](./prisma/schema.prisma)**
  Define la estructura de la base de datos. Aquí se encuentran los modelos principales, como `Reservation`, que incluye los campos necesarios para manejar el estado de la cita (pendiente, confirmada, cancelada) y los horarios.

- **[`app/actions/reservas.ts`](./app/actions/reservas.ts)**
  Contiene toda la lógica del lado del servidor (Server Actions) para las reservaciones. Aquí se implementa:
  - **Validación de disponibilidad:** Antes de crear una reservación, se verifica en la base de datos que el horario esté libre.
  - **Cancelación y Confirmación:** Funciones que actualizan el atributo `status` de una reservación específica de manera segura.

- **[`app/reservas/page.tsx`](./app/reservas/page.tsx)**
  Es la página principal del panel de reservaciones. Se encarga de:
  - Leer los parámetros de búsqueda de la URL y consultar a la base de datos a través de Prisma.
  - Generar la interfaz donde se implementan los **Filtros de Búsqueda** (mostrando visualmente solo las citas que cumplen el criterio seleccionado).
  - Renderizar el listado y mostrar los botones de acción dependiendo del estado de la cita.

- **[`app/reservas/boton-cancelar.tsx`](./app/reservas/boton-cancelar.tsx) / [`boton-confirmar.tsx`](./app/reservas/boton-confirmar.tsx)**
  Componentes de interfaz de usuario (UI) específicos para interactuar con las citas. Al hacer clic, se comunican directamente con los Server Actions correspondientes (`reservas.ts`) para cambiar el estado de la reservación visual y lógicamente.

## Cómo iniciar el proyecto

Para correr este proyecto localmente, sólo se necesita escribir este comando en la terminal:

```bash
npm run dev
```

**Nota:** Asegúrate de que las variables de entorno (como `DATABASE_URL` para Prisma) estén configuradas en un archivo `.env` en la raíz del proyecto.
