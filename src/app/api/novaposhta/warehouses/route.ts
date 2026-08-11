import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityRef = searchParams.get('cityRef') || '';
  const cityName = searchParams.get('cityName') || '';
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || ''; // 'Branch', 'Postomat', or empty for all

  if (!cityRef && !cityName) {
    return NextResponse.json({ warehouses: [] });
  }

  const apiKey = process.env.NOVA_POSHTA_API_KEY || '';

  try {
    const methodProperties: any = {
      Limit: '500',
      FindByString: q.trim(),
    };

    if (cityRef) {
      methodProperties.CityRef = cityRef;
    } else if (cityName) {
      methodProperties.CityName = cityName;
    }

    if (category === 'Postomat') {
      methodProperties.TypeOfWarehouseRef = 'f5e9ea12-b2f3-11e3-8267-005056804677'; // Postomat type ref in NP API (or filtered client-side)
    }

    const res = await fetch('https://api.novaposhta.ua/v2.0/json/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties,
      }),
      next: { revalidate: 3600 },
    });

    const data = await res.json();
    let rawWarehouses = data.data;

    // Fallback: If cityRef query returned 0 warehouses or failed, try by CityName
    if ((!data.success || !Array.isArray(rawWarehouses) || rawWarehouses.length === 0) && cityName) {
      const cleanCityName = cityName.replace(/^(м|смт|с|село|місто)\.?\s*/i, '').split(',')[0].trim();
      const fallbackProps: any = {
        Limit: '500',
        FindByString: q.trim(),
        CityName: cleanCityName,
      };
      if (category === 'Postomat') {
        fallbackProps.TypeOfWarehouseRef = 'f5e9ea12-b2f3-11e3-8267-005056804677';
      }
      const fallbackRes = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          modelName: 'Address',
          calledMethod: 'getWarehouses',
          methodProperties: fallbackProps,
        }),
        next: { revalidate: 3600 },
      });
      const fallbackData = await fallbackRes.json();
      if (fallbackData.success && Array.isArray(fallbackData.data)) {
        rawWarehouses = fallbackData.data;
      }
    }

    if (!Array.isArray(rawWarehouses)) {
      return NextResponse.json({ warehouses: [], rawError: data.errors });
    }

    let warehouses = rawWarehouses.map((item: any) => {
      const isPostomat =
        item.CategoryOfWarehouse === 'Postomat' ||
        item.Description?.toLowerCase().includes('поштомат');
      return {
        ref: item.Ref,
        number: item.Number,
        description: item.Description,
        shortAddress: item.ShortAddress,
        category: isPostomat ? 'Postomat' : 'Branch',
        typeOfWarehouse: item.TypeOfWarehouse,
        maxWeight: item.MaxWeightAllowed || item.PlaceMaxWeightAllowed || '30',
        phone: item.Phone || '',
      };
    });

    // Client-requested filter override if needed
    if (category === 'Branch') {
      warehouses = warehouses.filter((w: any) => w.category === 'Branch');
    } else if (category === 'Postomat') {
      warehouses = warehouses.filter((w: any) => w.category === 'Postomat');
    }

    return NextResponse.json({ warehouses });
  } catch (error: any) {
    console.error('Error fetching Nova Poshta warehouses:', error);
    return NextResponse.json({ error: 'Failed to fetch warehouses' }, { status: 500 });
  }
}
