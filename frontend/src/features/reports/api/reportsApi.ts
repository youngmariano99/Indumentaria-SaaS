import { apiClient } from "../../../lib/apiClient";

export interface MetodoPagoResumenDto {
    nombre: string;
    montoTotal: number;
    cantidadOperaciones: number;
}

export interface RankingProductoDto {
    nombre: string;
    cantidadVendida: number;
    totalMonto: number;
}

export interface PulsoDiarioDto {
    totalVentasHoy: number;
    cantidadTicketsHoy: number;
    ticketPromedioHoy: number;
    metodoPagoResumen: MetodoPagoResumenDto[];
    productosEstrella: RankingProductoDto[];
    variantesBajoStockMinimo: number;
}

export interface ItemABCModel {
    productoNombre: string;
    ingresosAcumulados: number;
    porcentajeDelTotal: number;
    clasificacion: string;
    rentabilidad: number;
}

export interface ReporteCorporativoDto {
    matrizABC: ItemABCModel[];
    margenBrutoTotal: number;
    porcentajeMargenBruto: number;
}

export interface VentaDiariaDto {
    dia: string;
    valor: number;
}

export interface CarteraClientesDto {
    clientesConDeuda: number;
    clientesActivos: number;
    deudaTotal: number;
}

export interface DashboardDto {
    usuariosActivos: number;
    usuariosRegistrados: number;
    diasRestantesMembresia: number;
    totalProductos: number;
    productosNuevosHoy: number;
    productosSinStock: number;
    productosStockBajo: number;
    ventasUltimos7Dias: VentaDiariaDto[];
    metodosPagoHoy: MetodoPagoResumenDto[];
    carteraClientes: CarteraClientesDto;
    topProductosSemana: RankingProductoDto[];
}

export const reportsApi = {
    getPulsoDiario: async (): Promise<PulsoDiarioDto> => {
        const response = await apiClient.get<PulsoDiarioDto>("/reportes/pulso-diario");
        return response.data;
    },
    getReporteCorporativo: async (): Promise<ReporteCorporativoDto> => {
        const response = await apiClient.get<ReporteCorporativoDto>("/reportes/corporativo");
        return response.data;
    },
    getDashboard: async (): Promise<DashboardDto> => {
        const response = await apiClient.get<DashboardDto>("/reportes/dashboard");
        return response.data;
    }
};
