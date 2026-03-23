"use client";

import { confirmarReserva } from "@/app/actions/reservas";
import { useState } from "react";

export function BotonConfirmarReserva({ id }: { id: number }) {
	const [error, setError] = useState<string | null>(null);

	async function manejarClick() {
		const resultado = await confirmarReserva(id);
		if (!resultado.exito) {
			setError(resultado.mensaje ?? "Error inesperado.");
		}
	}

	return (
		<div className="shrink-0">
			<button
				onClick={manejarClick}
				className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded hover:bg-green-100 transition-colors"
			>
				Confirmar
			</button>
			{error && <p className="text-xs text-red-400 mt-1">{error}</p>}
		</div>
	);
}
