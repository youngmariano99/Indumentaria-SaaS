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

export interface BajoStockDto {
    varianteId: string;
    productoNombre: string;
    varianteNombre: string;
    categoria: string;
    stockActual: number;
    stockMinimo: number;
    proveedor?: string;
}

export interface ValorizacionInventarioDto {
    categoria: string;
    valorTotalCosto: number;
    cantidadArticulos: number;
}

export interface AgingReportDto {
    clienteId: string;
    nombre: string;
    deudaTotal: number;
    ultimoMovimiento?: string;
    diasDeuda: number;
}

export interface CajaDetalleFerreteriaDto {
    ventasDirectasEfectivo: number;
    cobranzasCuentasCorrientes: number;
    cobranzasOtrosMetodos: number;
    totalCajaHoy: number;
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
    },
    getBajoStock: async (): Promise<BajoStockDto[]> => {
        const response = await apiClient.get<BajoStockDto[]>("/reportes/bajo-stock");
        return response.data;
    },
    getValorizacionInventario: async (): Promise<ValorizacionInventarioDto[]> => {
        const response = await apiClient.get<ValorizacionInventarioDto[]>("/reportes/valorizacion-inventario");
        return response.data;
    },
    getAgingReport: async (): Promise<AgingReportDto[]> => {
        const response = await apiClient.get<AgingReportDto[]>("/reportes/aging-report");
        return response.data;
    },
    getCajaFerreteria: async (): Promise<CajaDetalleFerreteriaDto> => {
        const response = await apiClient.get<CajaDetalleFerreteriaDto>("/reportes/caja-ferreteria");
        return response.data;
    }
};
