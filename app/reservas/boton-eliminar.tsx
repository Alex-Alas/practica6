"use client";

import { eliminarReserva } from "@/app/actions/reservas";
import { useState } from "react";
import { botonPeligro } from "@/app/lib/estilos";

export function BotonEliminarReserva({ id }: { id: number }) {
	const [error, setError] = useState<string | null>(null);

	async function manejarClick() {
		const resultado = await eliminarReserva(id);
		if (!resultado.exito) {
			setError(resultado.mensaje ?? "Error desconocido.");
		}
	}

	return (
		<div className="text-right shrink-0 ml-4">
			<button
				onClick={manejarClick}
				className="px-3 py-1.5 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
			>
				Eliminar
			</button>
			{error && <p className="text-xs text-red-400 mt-1">{error}</p>}
		</div>
	);
}
