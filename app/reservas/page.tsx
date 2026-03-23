import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BotonEliminarReserva } from "./boton-eliminar";
import { BotonCancelarReserva } from "./boton-cancelar";
import { BotonConfirmarReserva } from "./boton-confirmar";
import { tarjeta } from "@/app/lib/estilos";

const etiquetaEstado: Record<string, string> = {
  pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmada: "bg-green-50 text-green-700 border-green-200",
  cancelada: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function PaginaReservas({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  // 1. Obtenemos el parámetro 'estado' de la URL (async en Next.js 15+).
  const { estado } = await searchParams;

  // 2. Ejecutamos la consulta a Prisma aplicando un filtro 'where' si existe un estado.
  const reservas = await prisma.reserva.findMany({
    where: estado ? { estado } : {},
    orderBy: { fecha: "asc" },
    include: { servicio: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reservas</h1>
        <Link
          href="/reservas/nueva"
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition-colors"
        >
          Nueva reserva
        </Link>
      </div>

      {/* 3. Menú de navegación de filtros */}
      <div className="flex gap-4 mb-6 text-sm border-b pb-4 border-gray-100">
        <Link href="/reservas" className={!estado ? "font-bold underline" : "text-gray-500"}>Todos</Link>
        <Link href="/reservas?estado=pendiente" className={estado === "pendiente" ? "font-bold underline text-yellow-600" : "text-gray-500"}>Pendientes</Link>
        <Link href="/reservas?estado=confirmada" className={estado === "confirmada" ? "font-bold underline text-green-600" : "text-gray-500"}>Confirmadas</Link>
        <Link href="/reservas?estado=cancelada" className={estado === "cancelada" ? "font-bold underline text-gray-800" : "text-gray-500"}>Canceladas</Link>
      </div>

      {reservas.length === 0 ? (
        <p className="text-sm text-gray-400">No hay reservas registradas.</p>
      ) : (
        <ul className="space-y-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className={`${tarjeta} flex items-start justify-between`}
            >
              <div>
                <p className="font-medium text-sm">{reserva.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">{reserva.correo}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {reserva.servicio.nombre} -{" "}
                  {new Date(reserva.fecha).toLocaleString("es-SV")}
                </p>
                <span
                  className={`inline-block mt-2 text-xs px-2 py-0.5 rounded border ${
                    etiquetaEstado[reserva.estado] ?? etiquetaEstado.pendiente
                  }`}
                >
                  {reserva.estado}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* --- Lógica de botones según estado --- */}
                {reserva.estado === "pendiente" && (
                  <BotonConfirmarReserva id={reserva.id} />
                )}

                {reserva.estado !== "cancelada" ? (
                  <BotonCancelarReserva id={reserva.id} />
                ) : (
                  <BotonEliminarReserva id={reserva.id} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
