/**
 * Servicio para obtener tasas de cambio en tiempo real desde APIs externas.
 */

interface TasaBCV {
  current: {
    date: string;
    usd: number;
    eur: number;
  };
  previous: {
    date: string;
    usd: number;
    eur: number;
  };
  changePercentage: {
    usd: number;
    eur: number;
  };
}

interface TasaUSDT {
  moneda: string;
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export interface TasasCambio {
  dolarBCV: number;
  euroBCV: number;
  usdtPromedio: number;
  ultimaActualizacion: string;
}

/**
 * Obtiene las tasas de cambio del BCV (USD y EUR) desde la API de dolarvzla.com
 */
async function obtenerTasasBCV(): Promise<{ dolarBCV: number; euroBCV: number }> {
  try {
    const response = await fetch('https://rates.dolarvzla.com/bcv/current.json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Agregar timeout para evitar que la petición se cuelgue
      signal: AbortSignal.timeout(10000), // 10 segundos
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TasaBCV = await response.json();
    
    if (!data.current || !data.current.usd || !data.current.eur) {
      throw new Error('Invalid data format from BCV API');
    }
    
    return {
      dolarBCV: data.current.usd,
      euroBCV: data.current.eur,
    };
  } catch (error) {
    console.error('Error fetching BCV rates:', error);
    
    // Si es un error de timeout o de red, proporcionar un mensaje más específico
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Tiempo de espera agotado al conectar con el servidor BCV');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Error de conexión. Verifica tu internet o intenta usar una tasa personalizada');
      }
    }
    
    throw new Error(`No se pudo obtener tasas BCV: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene la tasa promedio de USDT desde la API de dolarapi.com
 */
async function obtenerTasaUSDT(): Promise<number> {
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/paralelo', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 segundos
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TasaUSDT = await response.json();
    
    if (!data.promedio || typeof data.promedio !== 'number') {
      throw new Error('Invalid data format from USDT API');
    }
    
    return data.promedio;
  } catch (error) {
    console.error('Error fetching USDT rate:', error);
    
    // Si es un error de timeout o de red, proporcionar un mensaje más específico
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Tiempo de espera agotado al conectar con el servidor USDT');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Error de conexión. Verifica tu internet o intenta usar una tasa personalizada');
      }
    }
    
    throw new Error(`No se pudo obtener tasa USDT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene todas las tasas de cambio disponibles en tiempo real
 */
export async function obtenerTasasCambio(): Promise<TasasCambio> {
  try {
    const [tasasBCV, tasaUSDT] = await Promise.all([
      obtenerTasasBCV(),
      obtenerTasaUSDT(),
    ]);

    return {
      dolarBCV: tasasBCV.dolarBCV,
      euroBCV: tasasBCV.euroBCV,
      usdtPromedio: tasaUSDT,
      ultimaActualizacion: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Fallback: intentar obtener tasas individualmente si falla Promise.all
    try {
      console.log('Intentando obtener tasas individualmente como fallback...');
      const tasasBCV = await obtenerTasasBCV();
      const tasaUSDT = await obtenerTasaUSDT();
      
      return {
        dolarBCV: tasasBCV.dolarBCV,
        euroBCV: tasasBCV.euroBCV,
        usdtPromedio: tasaUSDT,
        ultimaActualizacion: new Date().toISOString(),
      };
    } catch (fallbackError) {
      console.error('Fallback también falló:', fallbackError);
      throw new Error('No se pudieron obtener las tasas de cambio. Verifica tu conexión a internet o usa una tasa personalizada.');
    }
  }
}

/**
 * Obtiene una tasa específica según el tipo solicitado
 */
export async function obtenerTasaEspecifica(tipo: 'dolar_bcv' | 'euro_bcv' | 'promedio_usdt'): Promise<number> {
  switch (tipo) {
    case 'dolar_bcv':
      const tasasUSD = await obtenerTasasBCV();
      return tasasUSD.dolarBCV;
    case 'euro_bcv':
      const tasasEUR = await obtenerTasasBCV();
      return tasasEUR.euroBCV;
    case 'promedio_usdt':
      return await obtenerTasaUSDT();
    default:
      throw new Error('Tipo de tasa no válido');
  }
}
