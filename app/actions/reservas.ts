"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Esquema de validación para el formulario de reserva.
// servicioId llega como string desde el select y se convierte a número con z.coerce.
const EsquemaReserva = z.object({
	nombre: z.string().min(1, "El nombre es obligatorio."),
	correo: z.string().email("El correo no es válido."),
	fecha: z.string().min(1, "La fecha es obligatoria."),
	servicioId: z.coerce.number({ message: "Debe seleccionar un servicio." }),
});

// Crea una nueva reserva asociada a un servicio existente.
// La fecha se convierte a objeto Date antes de guardarse en la base de datos.
export async function crearReserva(_estadoPrevio: any, formData: FormData) {
	const campos = EsquemaReserva.safeParse({
		nombre: formData.get("nombre"),
		correo: formData.get("correo"),
		fecha: formData.get("fecha"),
		servicioId: formData.get("servicioId"),
	});

	// Si la validación falla, se retorna el objeto de errores al componente.
	if (!campos.success) {
		return {
			errores: campos.error.flatten().fieldErrors,
			mensaje: "Error de validación.",
		};
	}

	// Validación de disponibilidad:
	// 1. Obtener el servicio para conocer su duración
	const servicioElegido = await prisma.servicio.findUnique({
		where: { id: campos.data.servicioId },
	});

	if (!servicioElegido) {
		return { mensaje: "El servicio seleccionado no existe." };
	}

	// 2. Calcular el rango de fechas de la nueva reserva
	const nuevaInicio = new Date(campos.data.fecha);
	const nuevaFin = new Date(
		nuevaInicio.getTime() + servicioElegido.duracion * 60000,
	);

	// 3. Consultar reservas existentes para el mismo servicio.
	const reservasExistentes = await prisma.reserva.findMany({
		where: { servicioId: servicioElegido.id },
		include: { servicio: { select: { duracion: true } } },
	});

	// 4. Verificar si hay solapamiento con alguna reserva existente
	const hayConflicto = reservasExistentes.some((reserva) => {
		const eInicio = new Date(reserva.fecha);
		const eFin = new Date(
			eInicio.getTime() + reserva.servicio.duracion * 60000,
		);

		// Condicion de solapamiento: (InicioA < FinB) && (FinA > InicioB)
		return nuevaInicio < eFin && nuevaFin > eInicio;
	});

	if (hayConflicto) {
		return {
			mensaje:
				"Horario no disponible. Ya existe una reserva de este servicio que interfiere con este horario.",
		};
	}

	// 5. Crear la reserva si no hay conflictos
	await prisma.reserva.create({
		data: {
			nombre: campos.data.nombre,
			correo: campos.data.correo,
			fecha: new Date(campos.data.fecha),
			servicioId: campos.data.servicioId,
		},
	});

	// 6. Actualizar con nuevos datos
	revalidatePath("/reservas");
	redirect("/reservas");
}

// Elimina una reserva por ID.
// Retorna un objeto de resultado para que el componente pueda mostrar un error si falla.
export async function eliminarReserva(id: number) {
	try {
		await prisma.reserva.delete({ where: { id } });
		revalidatePath("/reservas");
		return { exito: true };
	} catch {
		return { exito: false, mensaje: "No se pudo eliminar la reserva." };
	}
}

// --- Ejercicio Complementario 2: Cancelación de reservas ---
// Cambia el estado de una reserva a "cancelada" en lugar de eliminarla.
export async function cancelarReserva(id: number) {
	try {
		// 1. Ejecutamos el update en la base de datos buscando por ID.
		await prisma.reserva.update({
			where: { id },
			data: { estado: "cancelada" },
		});

		// 2. Invalidamos la caché para que el listado muestre el cambio al instante.
		revalidatePath("/reservas");
		return { exito: true };
	} catch (error) {
		// 3. Retornamos un mensaje de error legible si ocurre algún fallo.
		return { exito: false, mensaje: "No se pudo cancelar la reserva." };
	}
}

// --- Ejercicio Complementario 4: Confirmación de reservas ---
// Cambia el estado de una reserva a "confirmada".
export async function confirmarReserva(id: number) {
	try {
		// 1. Ejecutamos el update en la base de datos buscando por ID.
		await prisma.reserva.update({
			where: { id },
			data: { estado: "confirmada" },
		});

		// 2. Invalidamos la caché para que el listado muestre el cambio al instante.
		revalidatePath("/reservas");
		return { exito: true };
	} catch (error) {
		// 3. Retornamos un mensaje de error legible si ocurre algún fallo.
		return { exito: false, mensaje: "No se pudo confirmar la reserva." };
	}
}
